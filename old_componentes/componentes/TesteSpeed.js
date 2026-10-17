(function(window, angular) {
    'use strict';

	AngularFindModule.factory('TesteSpeed' , TesteSpeed );
	
    TesteSpeed.$inject = [
    ];

	function TesteSpeed() {   
    

	    /**
	     * Constructor, with class name
	     */
	    function TesteSpeed(options) {

            var self = this;

            self.DEFAULT_OPTIONS = {
                latencyTestUrl: "/test"
                , downloadUrl: "/test.bin"
                , uploadUrl: "/post"
                , uploadDataSize: 5 * 1024 * 1024
                , uploadDataMaxSize: Number.MAX_VALUE
            };

            self.options = typeof options == 'undefined' ? self.DEFAULT_OPTIONS : options;

            self.calculateBandwidth = calculateBandwidth;
            self.truncate           = truncate;
            self.testDownloadSpeed  = testDownloadSpeed;
            self.testUploadSpeed    = testUploadSpeed;
            self.testLatency        = testLatency;
            self.testSpeed          = testSpeed;
            self.fimExec            = fimExec;
            
            self.XhrPromise = {
                create : function(options, promise) {
                    var that = this;

                    this.options = options;
                    this.promise = promise || new Promise(function(resolve, reject) {
                        that.executor(resolve, reject)
                    });

                    this.promise.cancel = that.cancel;          
                    this.promise.abort  = that.abort;

                    return this.promise;
                },            
                executor : function(resolve, reject) {
                    var that = this;

                    var xhr = new XMLHttpRequest();
                    that.xhr = xhr;
                    
                    xhr.open(that.options.method, that.options.url);
                    for (var h in that.options.headers) {
                        if (that.options.headers.hasOwnProperty(h)) {
                            xhr.setRequestHeader(h, that.options.headers[h]);
                        }
                    }

                    xhr.onload = function () {
                        if (this.readyState != 4) {
                            return;
                        }
                        if (this.status >= 200 && this.status < 300) {
                            resolve(this.responseText);
                        } else {
                            reject({
                              status: this.status,
                              statusText: this.statusText
                            });
                        }
                    };

                    xhr.onreadystatechange = function() {
                        if (this.status == 0) {
                            reject(that.REJECT_RESPONSE);
                        };
                    };

                    xhr.onerror = function () {
                        reject({
                            status: this.status,
                            statusText: this.statusText
                        });
                    };

                    xhr.onabort = function () {
                        reject(that.REJECT_RESPONSE);
                    };

                    xhr.send(that.options.data);
                },            
                cancel : function() {
                    this.abort();
                },            
                abort : function() {
                    this.xhr.abort();
                },            
                then : function(a, b) {
                    var p = self.XhrPromise.create(this.options, this.promise.then(a, b));
                    p.xhr = this.xhr;
                    return p;
                },            
                REJECT_RESPONSE : function() {
                    return {
                        status: -1,
                        statusText: "Canceled"
                    };
                }
            }
           
        }

        function fimExec(){

        }

        /**
         * Calculates the bandwidth in bps (bits per second)
         * @param size the size in bytes to be transfered
         * @param startTime the time when the transfer started. The end time is 
         * considered to be now.
         */
        function calculateBandwidth(size, start) {
            return (size * 8) / ((new Date().getTime() - start) / 1000);
        }

        function truncate(data, maxSize) {
            if (maxSize === undefined) {
                return;
            }
            if (data.length > maxSize) {
                if (data.substring) {
                    data = data.substring(0, maxSize);
                } else {
                    data.length = maxSize;
                }
            }
            return data;
        }

        function testDownloadSpeed(options) {
            var self = this;

            options = typeof options == 'undefined' ? self.options : options;

            var start = new Date().getTime();
            var r = self.XhrPromise.create({
                    method: "GET",
                    url: options.downloadUrl + "?id=" + start,
                    dataType: 'application/octet-stream',
                    headers: {'Content-type': 'application/octet-stream'}});
            var r1 = r.then( 
                    function(response) {
                        return {downloadSpeed: self.calculateBandwidth((response.data || response).length, start), data: response.data || response};
                    });
            r1.cancel = r.cancel;
            return r1;
        }

        function testUploadSpeed(options) {
            var self = this;
            options = typeof options == 'undefined' ? self.options : options;
            // generate randomly the upload data
            if (!options.uploadData) {
                options.uploadData = new Array(Math.min(options.uploadDataSize, options.uploadDataMaxSize));
                for (var i = 0; i < options.uploadData.length; i++) {
                    options.uploadData[i] = Math.floor(Math.random() * 256);
                }
            } else {
                options.uploadData = self.truncate(options.uploadData, options.uploadDataMaxSize);
            }
            var start = new Date().getTime();
            var r = self.XhrPromise.create({
                    method: "POST",
                    url: options.uploadUrl + "?id=" + start,
                    data: options.uploadData,
                    dataType: 'application/octet-stream',
                    headers: {'Content-type': 'application/octet-stream'}});
            var r1 = r.then(
                    function(response) {
                        return {uploadSpeed: self.calculateBandwidth(options.uploadData.length, start)};
                    });
            r1.cancel = r.cancel;
            return r1;
        }

        function testLatency(options) {
            var self = this;
            options = typeof options == 'undefined' ? self.options : options;
            options.latencyTestUrl = options.latencyTestUrl || options.downloadUrl;
            var start = new Date().getTime();
            var r = self.XhrPromise.create({
                    method: "HEAD",
                    url: options.latencyTestUrl + "?id=" + start,
                    dataType: 'application/octet-stream',
                    headers: {'Content-type': 'application/octet-stream'}});
            var r1 = r.then(
                    function(response) {
                        // time divided by 2 because of 3-way TCP handshake
                        return {latency: (new Date().getTime() - start) / 2};
                    });
            r1.cancel = r.cancel;
            return r1;
        }

        function testSpeed(options) {
            var self = this;
            var r;
            r = self.testLatency(options);
            var r1 = r.then(
                    function(latencyResult) {	
                        r = self.testDownloadSpeed(options);
                        var r1 = r.then(
                                function(downloadResult) {
                                    options.uploadData = downloadResult.data;
                                    r = self.testUploadSpeed(options);
                                    var r1 = r.then(
                                                function(uploadResult) {

                                                    self.fimExec();

                                                    return {latency: latencyResult.latency, 
                                                            downloadSpeed: downloadResult.downloadSpeed, 
                                                            uploadSpeed: uploadResult.uploadSpeed};
                                                }
                                            );
                                    r1.cancel = r.cancel;
                                    return r1;
                                }
                            );
                        r1.cancel = r.cancel;
                        return r1;
                    });
            r1.cancel = r.cancel;
            return r1;
        }

	    /**
	     * Return the constructor function
	     */
	    return TesteSpeed;
    };

})(window, window.angular);