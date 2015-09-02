/* IRKit extension for ScratchX */
/* Tetsunori.Nakayama, Sep 2015 */

new (function() {
    var ext = this;
    var ip_addr = '192.168.10.2';

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.turnOnLight = function(callback) {
        var ir_data = '{"format":"raw","freq":38,"data":[6881,3341,873,873,873,873,873,2537,873,2537,873,873,873,2537,873,873,873,873,873,873,873,2537,873,873,873,873,873,2537,873,873,873,2537,873,873,873,2537,873,873,873,873,873,2537,873,873,873,873,873,873,873,873,873,873,873,873,873,2537,873,873,873,2537,873,2537,873,873,873,873,873,2537,873,873,873,2537,873,2537,873,2537,873,2537,873,873,873,873,873,65535,0,65535,0,19315,6881,3341,873,873,873,873,873,2537,873,2537,873,873,873,2537,873,873,873,873,873,873,873,2537,873,873,873,873,873,2537,873,873,873,2537,873,873,873,2537,873,873,873,873,873,2537,873,873,873,873,873,873,873,873,873,873,873,873,873,2537,873,873,873,2537,873,2537,873,873,873,873,873,2537,873,873,873,2537,873,2537,873,2537,873,2537,873,873,873,873,873]}';
        var url = 'http://'+ip_addr+'/messages';
        $.ajax( url, { crossDomain: true, type: "POST", dataType: 'text',
                     data: JSON.stringify( ir_data ) ,
          success: function(result){
            callback();
          }
        });
    };

    ext.turnOffLight = function(callback) {
        var ir_data = '{"format":"raw","freq":38,"data":[6881,3458,815,904,815,904,815,2626,815,2626,815,904,815,2626,815,904,815,904,815,904,815,2626,815,904,815,904,815,2626,815,904,815,2626,815,904,815,2626,815,904,815,904,815,2626,815,904,815,904,815,904,815,904,815,2626,815,2626,815,2626,815,904,815,2626,815,2626,815,904,815,904,815,904,815,2626,815,2626,815,2626,815,2626,815,2626,815,904,815,904,815,65535,0,65535,0,19315,6881,3458,815,904,815,904,815,2626,815,2626,815,904,815,2626,815,904,815,904,815,904,815,2626,815,904,815,904,815,2626,815,904,815,2626,815,904,815,2626,815,904,815,904,815,2626,815,904,815,904,815,904,815,904,815,2626,815,2626,815,2626,815,904,815,2626,815,2626,815,904,815,904,815,904,815,2626,815,2626,815,2626,815,2626,815,2626,815,904,815,904,815]}';
        var url = 'http://'+ip_addr+'/messages';
        $.ajax( url, { crossDomain: true, type: "POST", dataType: 'text',
                     data: JSON.stringify( ir_data ) ,
          success: function(result){
            callback();
          }
        });
    };

    ext.setIPAddr = function(ipaddr) {
        ip_addr = ipaddr;
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
          ['w', 'Turn the Light OFF!', 'turnOffLight'],
          ['w', 'Turn the Light ON!', 'turnOnLight'],
          [' ', 'Set IRKit IP Address : %s', 'setIPAddr', '192.168.10.2'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('IRKit extension', descriptor, ext);
})();
