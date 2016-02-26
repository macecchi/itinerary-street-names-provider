const root = './core';
module.exports = {
	Database:		require(`${root}/database`),
	Http: 			require(`${root}/http`),
	Logger: 		require(`${root}/log/logger`),
	LoggerFactory: 	require(`${root}/log/loggerFactory`)
}