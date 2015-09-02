/* IRKit extension for ScratchX */
/* Tetsunori.Nakayama, Sep 2015 */

new (function() {
    var ext = this;

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.turnOnLight = function(ip_addr, callback) {
        var ir_data = '{"format":"raw","freq":38,"data":[6881,3341,873,873,873,873,873,2537,873,2537,873,873,873,2537,873,873,873,873,873,873,873,2537,873,873,873,873,873,2537,873,873,873,2537,873,873,873,2537,873,873,873,873,873,2537,873,873,873,873,873,873,873,873,873,873,873,873,873,2537,873,873,873,2537,873,2537,873,873,873,873,873,2537,873,873,873,2537,873,2537,873,2537,873,2537,873,873,873,873,873,65535,0,65535,0,19315,6881,3341,873,873,873,873,873,2537,873,2537,873,873,873,2537,873,873,873,873,873,873,873,2537,873,873,873,873,873,2537,873,873,873,2537,873,873,873,2537,873,873,873,873,873,2537,873,873,873,873,873,873,873,873,873,873,873,873,873,2537,873,873,873,2537,873,2537,873,873,873,873,873,2537,873,873,873,2537,873,2537,873,2537,873,2537,873,873,873,873,873]}';
        var url = 'http://='+ip_addr+'/messages';
        $.ajax( url, { crossDomain: true, type: "POST", dataType: 'text',
                     data: JSON.stringify( ir_data ) ,
          success: function(result){
          }
        });
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['R', 'IRKit IP:%s, Turn the Light ON!', 'turnOnLight', '192.168.10.2'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('IRKit extension', descriptor, ext);
})();
