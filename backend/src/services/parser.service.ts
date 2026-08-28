import fs from "fs";
import path from "path";
import { Project } from "ts-morph";

const IGNORED_DIRS = ["node_modules", ".git", "dist", "build", ".next"];
const VALID_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

export const getAllSourceFiles = (dir: string, fileList: string[] = []): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.includes(entry.name)) {
        getAllSourceFiles(fullPath, fileList);
      }
    } else if (VALID_EXTENSIONS.includes(path.extname(entry.name))) {
      fileList.push(fullPath);
    }
  }

  return fileList;
};

export interface FileImport {
  filePath: string;
  imports: string[];
}

export const extractImports = (files: string[]): FileImport[] => {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
  });

  project.addSourceFilesAtPaths(files);

  const results: FileImport[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    const imports = sourceFile
      .getImportDeclarations()
      .map((imp) => imp.getModuleSpecifierValue());

    results.push({
      filePath: sourceFile.getFilePath(),
      imports,
    });
  }

  return results;
};

export interface GraphNode {
  nodeId: string;
  type: "file";
  path: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: "imports";
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const buildDependencyGraph = (rootDir: string, fileImports: FileImport[]): DependencyGraph => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenNodes = new Set<string>();

  const toRelative = (absPath: string): string => {
    return path.relative(rootDir, absPath).replace(/\\/g, "/");
  };

  for (const file of fileImports) {
    const relPath = toRelative(file.filePath);

    if (!seenNodes.has(relPath)) {
      nodes.push({ nodeId: relPath, type: "file", path: relPath });
      seenNodes.add(relPath);
    }

    for (const imp of file.imports) {
      if (!imp.startsWith(".")) continue;

      const resolvedPath = path.resolve(path.dirname(file.filePath), imp);

      const matchedFile = fileImports.find((f) => {
        const withoutExt = f.filePath.replace(/\.(ts|tsx|js|jsx)$/, "");
        return (
          f.filePath === resolvedPath ||
          withoutExt === resolvedPath ||
          f.filePath === resolvedPath + ".ts" ||
          f.filePath === resolvedPath + ".tsx" ||
          f.filePath === resolvedPath + ".js" ||
          f.filePath === resolvedPath + ".jsx"
        );
      });

      if (!matchedFile) continue;

      const targetRelPath = toRelative(matchedFile.filePath);

      if (!seenNodes.has(targetRelPath)) {
        nodes.push({ nodeId: targetRelPath, type: "file", path: targetRelPath });
        seenNodes.add(targetRelPath);
      }

      edges.push({
        from: relPath,
        to: targetRelPath,
        type: "imports",
      });
    }
  }

  return { nodes, edges };
};

export interface AffectedNode {
  nodeId: string;
  type: "file";
  path: string;
  riskWeight: number;
}

export const computeBlastRadius = (
  graph: DependencyGraph,
  changedFiles: string[]
): AffectedNode[] => {
  const reverseAdjacency = new Map<string, string[]>();

  for (const edge of graph.edges) {
    if (!reverseAdjacency.has(edge.to)) {
      reverseAdjacency.set(edge.to, []);
    }
    reverseAdjacency.get(edge.to)!.push(edge.from);
  }

  const affected = new Set<string>();
  const queue: string[] = [...changedFiles];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (affected.has(current)) continue;
    affected.add(current);

    const dependents = reverseAdjacency.get(current) || [];
    for (const dep of dependents) {
      if (!affected.has(dep)) {
        queue.push(dep);
      }
    }
  }

  const dependentCounts = new Map<string, number>();
  for (const nodeId of affected) {
    const count = (reverseAdjacency.get(nodeId) || []).length;
    dependentCounts.set(nodeId, count);
  }

  return Array.from(affected).map((nodeId) => {
    const node = graph.nodes.find((n) => n.nodeId === nodeId);
    return {
      nodeId,
      type: "file" as const,
      path: node?.path || nodeId,
      riskWeight: dependentCounts.get(nodeId) || 0,
    };
  });
};