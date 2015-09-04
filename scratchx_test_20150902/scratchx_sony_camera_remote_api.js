/* Sony Camera Remote API extension for ScratchX */
/* Tetsunori.Nakayama, Sep 2015 */

new (function() {
    var ext = this;
    var camera_ctrl_uri = 'http://10.0.0.1:10000/sony/camera';
    var taken_picture_url = '';

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // Execute actTakePicture.
    ext.actTakePicture = function( callback ) {
        $.ajax( camera_ctrl_uri, { crossDomain: true, type: "POST", dataType: 'text',
                     data: JSON.stringify( '{"method":"actTakePicture","params":[],"id":3}' ) ,
          success: function( result ){
            callback();
            taken_picture_url = result;
          }
        });
    };

    /*
    // Get a learned IR Code from IRKit.
    ext.getIRCode = function( callback ) {
        $.ajax( camera_ctrl_uri, { crossDomain: true, type: "GET", dataType: 'text',
          success: function( ir_data ){
            callback( ir_data );
          }
        });
    };
    */

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
          ['w', 'Take Picture', 'actTakePicture' ]
          // ['R', 'Get IR Code', 'getIRCode'],
          // [' ', 'Set IRKit IP Address : %s', 'setIPAddr', '192.168.10.2'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('Sony Camera Remote API extension test', descriptor, ext);
})();
