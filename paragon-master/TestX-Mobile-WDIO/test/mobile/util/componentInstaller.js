var fs = require('fs');
var fsextra = require('fs-extra');
var asTable = require('as-table');
var request = require('request');
var path = require('path');
var tmp = require('tmp');
var tar = require('tar');
var rimraf = require("rimraf");  
var logger = require('Logger');


/**
 * Component Installer, provides the ability to install components onto the host system.
 * @constructor
 * @param {configFile instance} configFile - An instance of package.json file
 */
var ComponentInstaller = function(configFile) {
	
	if (!configFile) {
		throw new Error('ComponentInstaller requires package file path instance for instantiation');
	}

	this.configFile 		= configFile;
	this.fs					= fs;
	this.fsextra			= fsextra;
	this.asTable			= asTable;
	this.request			= request;
	this.path				= path;
	this.tmp				= tmp;
	this.rimraf				= rimraf;
	this.logged				= logger;

	//make accessible globally
	global.ComponentInstaller = this;
};


/**
 * display component data as table.
 * @function
 * @param {Object} objects - JSON Object for data display .
 * @access private
 */
ComponentInstaller.prototype.displayTable = function(objects) {
	console.log(this.asTable(objects));
	console.log('');
};

/**
 * read configuration.
 * @function
 * @access private
 * @param {Object} configFile - An instane of package.json file 
 * @return {Promise} - A promise that either resolves with the configFile, or rejects
 * if it cannot read the configFile.
 */
ComponentInstaller.prototype._readConfig = function(configFile) {
	return new Promise((resolve, reject) => {
		this.fs.readFile(configFile, (err, buf) => {
			if (err) {
				return reject(err);
			}

			var data = null;
			try {
				data = JSON.parse(buf.toString('utf8'));
			} catch(e) {
				return reject(e);
			}
			return resolve(data);
		});
	});
};



/**
 * Downloads the component from the remote source.
 * @function
 * @param {Object} component - The component to download
 * @return {Promise} - A promise that resolves if the component was successfully
 * downloaded, and rejects if there was an issue detected with the download.
 */
ComponentInstaller.prototype.downloadFile = function(component) {
	return new Promise((resolve, reject) => {
		console.log('Downloading file...');
		//now download the file to our temp location
		
		this.request.get({
			url 		: component.location,
			encoding 	: null
		}, (err, response, body) => {
			if (err) {
				console.log("Error downloading file!");
				console.log('');
				return reject(err);
			}

			if (response.statusCode === 404) {
				console.log("Error downloading file! File not found!");
				console.log('');
				return reject(new Error('File not found'));
			}

			if (response.statusCode !== 200) {
				console.log("Error downloading file! Server responded with" + response.statusCode);
				console.log('');
				return reject(new Error('Invalid status code received'));
			}

			console.log("File downloaded!");
			return resolve(body);	

		});

	});
};

/**
 * Saves the content of a component.
 * @function
 * @param {Object} component - The components configuration
 * @param {Buffer} content - The binary content to save
 * @return {Promise} - A promise that resolves it the component was correctly
 * saved, or rejects if there is an issue saving the file.
 */
ComponentInstaller.prototype.saveFile = function(component, content) {
	return new Promise((resolve, reject) => {
		component.path = this.path.join(process.cwd(), component.path);

		console.log("Writing file to "+ component.path);
		this.fs.writeFile(component.path, content, (err) => {
			if (err) {
				console.log("Error writing file!");
				return reject(err);
			}

		console.log("File written!");
		return resolve(this.path.dirname(component.path));	
		
		});

	});
};


/**
 * Decompress the component if its tar, gzip.
 * @function
 * @param {Object} component - The components configuration
 * @return {Promise} - A promise that resolves it the component was correctly
 * decompressed, or rejects if there is an issue decompressing the file.
 */
ComponentInstaller.prototype.decompressFile = function(component) {
	return new Promise((resolve, reject) => {

		//generate a destination path for file extraction
		let filename = component.path.split('/').slice(-1)[0]
		component.destination = component.path.replace(filename,'');

		//decompress the file
		console.log("File decompression started!")
		tar.extract({
			cwd: component.destination,
			file: component.path
		}, function(err){
			if(err) {
				console.log("Error decompressing file!");
				console.log(err);
				return reject(err);
			} else {
				console.log("File decompression done!");
				return resolve(component.destination);
			}
		})
	});
};

/**
 * Move files to desired directories.
 * @function
 * @param {Object} component - The components configuration
 * @return {Promise} - A promise that resolves it the component was correctly
 * copied to desiere directory, or rejects if there is an issue moving the file.
 */
ComponentInstaller.prototype.moveFiles = function(component) {
	return new Promise((resolve, reject) => {

		console.log("Moving files")
		
		//generate path for file movement
		let copySourcePath = component.destination + '/var/tmp/Debug-iphonesimulator/FIPhoneASP.app';
		let copyDestPath = component.destination + '/ModernApp3.0.app';

		this.fsextra.move(copySourcePath, copyDestPath, {clobber: true},function(err) {
			if(err) {
				console.log("Extracted file could not be moved!!");
				console.log(err);
				return reject();
			}
			console.log("Extracted file moved!");
			return resolve(copyDestPath); 
		})

	});
};

/**
 * Cleanup directories.
 * @function
 * @param {Object} component - The components configuration
 * @return {Promise} - A promise that resolves it the component was correctly
 * cleaned up for temp files, or rejects if there is an issue cleaning the temp file.
 */
ComponentInstaller.prototype.cleanFiles = function(component) {
	return new Promise((resolve, reject) => {

		console.log("cleaning direcory")
		this.rimraf(component.destination + '/var', function (err) {
			if(err) {
				console.log("Error cleaning directory")
				console.log(err)
				return reject();
			} 
			console.log("Directory cleaned!!");
			return resolve();
		})
	});
};


/**
 * Carry out the installation for a single component.
 * @function
 * @param {Object} component - The component to install.
 * @param {Object} config - Our package configuration.
 * @return {Promise} - A promise that resolves if the installation
 * process completed successfully, or a rejection if there was an error.
 */
ComponentInstaller.prototype.doInstall = function(component, config) {
	return new Promise((resolve, reject) => {
		
		//are we missing the location field?
			if (typeof(config.componentRepository) === 'undefined') {
				console.log("No component artefact store configured!");
				console.log("Ensure you set the 'componentRepository' value in your package.json before attempting this again.");
				return reject(new Error("No component artefact store configured!"));
			}

			//just assume there are no nasty URI encoding things in there for now
			component.location = config.componentRepository + component.componentPlatformPath;
			component.location += global.componentfilePath + '/';
			component.location += global.componentfilePath + '-';
			component.location += component.name + '-';
			component.location += component.version + '-';
			component.location += component.release + '.';
			component.location += component.extension;
			console.log(component.location);	
		//generate a filename for local storage from our URL
		component.filename = component.location.split('/').slice(-1)[0];

		console.log("Attempting to install version " + component.version + " of " + component.filename);

		//download it
		return this.downloadFile(component, config).then((content) => {
			
			//save it
			return this.saveFile(component, content).then(() => {
				
				if(component.extension == 'tar.gz') {
					//decompress it
					return this.decompressFile(component).then(() => {
						
						return this.moveFiles(component).then(() => {
							return this.cleanFiles(component);
						})						
					});
				} 
			
				return resolve();
				
			});
			
		}).then((filePath) => {
			//installation complete!
			console.log("Component fetched successfully!");
			return resolve();
		}).catch(() => {
			console.log("Component fetch failed!");
			console.log();
			return reject();
		});
	});
};


/**
 * Carry out the component installation process.
 * @function
 * @param {Object} options - Any options that were provided for the task.
 * @return {Promise} - A Promise that resolves if all of the components were installed
 * correctly, otherwise a rejection along with the error that was detected.
 */
ComponentInstaller.prototype.install = function(options) {
	return new Promise((resolve, reject) => {

		console.log("");
		console.log("Component Installation");
		console.log("The component installer will now attempt to install any components you have configured within your project.");

		this._readConfig(this.configFile).then((configData) => {

			if (typeof(configData.components) === 'undefined' || configData.components.length === 0) {
				console.log('No Components found in file' + this.configFile);
				console.log("No components found!");
				console.log('');
				return resolve();
			}

			console.log("Found the following components:");
			console.log('');

			var components = configData.components;

			//log out what we have discovered
			this.displayTable(components);

			var self = this;

			//now install each of them
			function doInstall() {
				if (components.length === 0) {
					return Promise.resolve();
				}

				var component = components.shift();

				return self.doInstall(component, configData).then(() => {
					return doInstall();
					}).catch((err) => {
						return reject(err);
				});

				return doInstall();
			}

			return doInstall().then(() => {
				return resolve();
			}).catch((err) => {
				return reject(err);
			});

		});
	 
	});	
};

module.exports = function(configData) {
	return new ComponentInstaller(configData);
};