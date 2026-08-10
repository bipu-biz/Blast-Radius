class apiError extends Error{
    statuscode: number
    success: boolean
    errors: any[]
    constructor(
        statuscode: number,
        message: string = 'something went wrong',
        errors : any[] = []
    ){
        super(message)
        this.statuscode=statuscode
        this.success = false
        this.errors = errors
        Error.captureStackTrace(this,this.constructor)
    }
}

export default apiError