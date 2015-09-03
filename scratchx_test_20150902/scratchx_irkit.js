/* IRKit extension for ScratchX */
/* Tetsunori.Nakayama, Sep 2015 */

new (function() {
    var ext = this;
    var irkit_ip_addr = '192.168.10.2';

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // Send IR Data to IRKit and request IRKit emit it.
    ext.sendIRCommand = function( ir_data, callback ) {
        var url = 'http://'+irkit_ip_addr+'/messages';
        $.ajax( url, { crossDomain: true, type: "POST", dataType: 'text',
                     data: JSON.stringify( ir_data ) ,
          success: function( result ){
            callback();
          }
        });
    };

    // Get a learned IR Code from IRKit.
    ext.getIRCode = function( callback ) {
        var url = 'http://'+irkit_ip_addr+'/messages';
        $.ajax( url, { crossDomain: true, type: "GET", dataType: 'text',
          success: function( ir_data ){
            callback( ir_data );
          }
        });
    };

    // Set IP Address of IRKit.
    ext.setIPAddr = function( ip_addr ) {
        irkit_ip_addr = ip_addr;
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
          ['w', 'Send IR Command : %s', 'sendIRCommand', 'IR Code'],
          ['R', 'Get IR Code', 'getIRCode'],
          [' ', 'Set IRKit IP Address : %s', 'setIPAddr', '192.168.10.2'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('IRKit extension', descriptor, ext);
})();
