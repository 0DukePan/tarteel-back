import winston from "winston";

const logFormat = winston.format.combine(
    winston.format.timestamp({format : 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.errors({stack : true}),
    winston.format.json()
)

export const logger = winston.createLogger({
    level : process.env.LOG_LEVEL || 'info',
    format : logFormat,
    defaultMeta : {service : 'quran-school-api'},
    transports :[
        new winston.transports.File({
            filename : 'logs/error.log',
            level : 'error',
            maxsize : 5242880 , //5mb
            maxFiles : 5
        }),
        new winston.transports.File({
            filename : 'logs/combined.log',
            maxsize : 5242880,
            maxFiles : 5
        })
    ]
})

if(process.env.NODE_ENV !== 'production'){
    logger.add(
        new winston.transports.Console({
            format : winston.format.combine(winston.format.colorize() , winston.format.simple())
        })
    )
}