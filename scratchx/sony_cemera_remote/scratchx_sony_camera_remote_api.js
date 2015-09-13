
/* Sony Camera Remote API extension for ScratchX */
/* Tetsunori.Nakayama, Sep 2015 */

new (function() {
  
  //
  /* Constants */
  //
  var STRING_SHOOTMODE_STILL = 'still';
  var STRING_SHOOTMODE_MOVIE = 'movie';
  
  var STRING_CAMERA_STATUS_IDLE = 'IDLE';
  var STRING_CAMERA_STATUS_MOVIE_RECORDING = 'MovieRecording';
  
  //
  /* Variables */
  //
  // Array for camera objects
  var cameras = {};
  
  // Scracthx extension object
  var ext = this;
  
  //
  /* Scratchx mandatory functions */
  //  
  // Cleanup function when the extension is unloaded
  ext._shutdown = function() {};
  
  // Status reporting code
  // Always Ready in this extension. :-p
  ext._getStatus = function() {
      return {status: 2, msg: 'Ready'};
  };
  
  //
  /* Functions for Blocks */
  //  
  // Set Camera Control URI. Also it acts as an Initializer.
  // Sync Command Block.
  //   camID : Target camera ID.
  //   uri   : Camera control Interface.
  ext.setCameraCtrlURI = function( camID, uri ) {
    
    console.log( '[setCameraCtrlURI] Start, [' + camID + '].' );
    
    // Check uri
    if( uri.indexOf( 'http://' ) == -1 ){
      window.alert( '[Set Camera Control URI] Illegal uri. Input as "http://10.0.0.1:10000/sony/camera"' );
      return;
    }
    
    // Check doubly registration.
    for( key in cameras ){
      if( cameras[key].camera_ctrl_uri === uri ){
        // Already exists...
        cameras[key].status_req.abort();  // Stop getEvent API.
        delete cameras[key];
        break;
      }
    }
    
    // Prepare properties
    var tmp_obj = {};
    tmp_obj.camera_ctrl_uri = uri;
    tmp_obj.taken_picture_url = '';
    tmp_obj.shootmode = '';
    tmp_obj.camera_status = '';
    
    // Add camera object to the array.
    cameras[camID] = tmp_obj;
    
    // Start getEvent API polling!
    __getStatus( camID, false );
    
  };
  
  // Get Current Shoot mode.
  // Sync Reporter Block.
  //   camID : Target camera ID.
  ext.getShootMode = function( camID ) {
    console.log( '[Start] getShootMode camID[' + camID + '].' );
    return cameras[camID].shootmode
  };
  
  // Set Shoot mode.
  // Async Command Block.
  //   camID      : Target camera ID.
  //   shoot_mode : shoot mode to set
  ext.setShootMode = function( camID, shoot_mode, callback ) {
    
    console.log( '[Start] setShootMode camID[' + camID + '], shoot mode[' + shoot_mode + '].' );
    
    // Check some parameters and status.
    if( !isValidCameraID( camID ) ){
      window.alert( '[Set Shoot Mode] Failed to set shoot mode. camID[' + camID + '] is wrong.' );
      callback();
      return;
    }
    
    if( cameras[camID].camera_ctrl_uri == '' ){
      window.alert( '[Set Shoot Mode] Failed to set shoot mode. uri is not set.' );
      callback();
      return;
    }
    
    if( cameras[camID].camera_status != STRING_CAMERA_STATUS_IDLE ){
      cameras[camID].queued_func = function(){ ext.setShootMode( camID, shoot_mode, callback ); };
      console.log( '[setShootMode] Failed to set shoot mode. [' + camID + '] status is [' + cameras[camID].camera_status + '].' );
      return;
    }
    
    if( ( shoot_mode != STRING_SHOOTMODE_STILL ) &&
          ( shoot_mode != STRING_SHOOTMODE_MOVIE ) ){
      console.log( '[setShootMode] Failed to set shoot mode. Shoot mode[' + shoot_mode + '] is wrong.' );
      callback();
      return;
    }
    
    // Already set...
    if( shoot_mode == cameras[camID].shootmode ){
      console.log( '[setShootMode] Already shoot mode is [' + shoot_mode + ']' );
      callback();
      return;
    }
    
    // Prepare for notification on shoot mode change.
    cameras[camID].queued_func_shootmode = function( sht_md ){ 
      if( sht_md == shoot_mode ){ 
        // desired notification case
        callback(); 
        return 0;
      }else{
        // ignore...
        console.log( "[setShootMode] shoot_mode not match. arg:[" + sht_md + '], desired:[' + shoot_mode + '].' );
        return -1;
      }
    };
    
    // Issue setShootMode API.
    $.ajax( cameras[camID].camera_ctrl_uri, { crossDomain: true, type: "POST", dataType: 'text',
                 data: JSON.stringify( { method:"setShootMode", params:[ shoot_mode ], id:3 } ) ,
      success: function( result ){
        if( ($.parseJSON(result)).hasOwnProperty('error') ){
          var api_err = $.parseJSON(result).error[0]
          console.log( '[setShootMode] web api error. [' + api_err + ']' );
          if( api_err == 40401 ){
            console.log( '[setShootMode] Camera is NOT READY. Retry!' );
            ext.setShootMode( camID, shoot_mode, callback );
          }
          return;
        }
      }
    });
    
  };
  
  // Get Still Mode Value(Constant).
  // Sync Reporter Block.
  ext.getStillModeValue = function() {
      return STRING_SHOOTMODE_STILL;
  };
  
  // Get Movie Mode Value(Constant).
  // Sync Reporter Block.
  ext.getMovieModeValue = function() {
      return STRING_SHOOTMODE_MOVIE;
  };
  
  // Get Current Camera Status.
  // Sync Reporter Block.
  //   camID : Target camera ID.
  ext.getCameraStatus = function( camID ) {
    console.log( '[Start] getCameraStatus camID[' + camID + '].' );
    return cameras[camID].camera_status;
  };
  
  // Get IDLE Status Value(Constant).
  // Sync Reporter Block.
  ext.getIdleValue = function() {
      return STRING_CAMERA_STATUS_IDLE;
  };
  
  // Get Movie Recording Status Value(Constant).
  // Sync Reporter Block.
  ext.getMovieRecordingValue = function() {
      return STRING_CAMERA_STATUS_MOVIE_RECORDING;
  };
  
  // Execute actTakePicture.
  // Async Command Block.
  // Take a picture.
  //   camID : Target camera ID.
  ext.actTakePicture = function( camID, callback ) {
    
    console.log( '[actTakePicture] Start, camID[' + camID + '].' );
    
    // Check parameters and some status.
    if( !isValidCameraID( camID ) ){
      window.alert( '[Take Picture] Failed to take picture. camID is wrong.' );
      callback();
      return;
    }
    
    if( cameras[camID].camera_ctrl_uri == '' ){
      window.alert( '[Take Picture] Failed to take picture. uri is not set.' );
      callback();
      return;
    }
    
    if( cameras[camID].shootmode != STRING_SHOOTMODE_STILL ){
      window.alert( '[Take Picture] Failed to take picture. shoot mode is not [still].' );
      callback();
      return;
    }
    
    if( cameras[camID].camera_status != STRING_CAMERA_STATUS_IDLE ){
      cameras[camID].queued_func = function(){ ext.actTakePicture( camID, callback ); };
      console.log( '[actTakePicture] Failed to take picture. [' + camID + '] status is [' + cameras[camID].camera_status + '].' );
      return;
    }
    
    // Issue actTakePicture API
    $.ajax( cameras[camID].camera_ctrl_uri, { crossDomain: true, type: "POST", dataType: 'text',
                 data: JSON.stringify( { method:"actTakePicture", params:[], id:3 } ) ,
      success: function( result ){
        if( ($.parseJSON(result)).hasOwnProperty('error') ){
          var api_err = $.parseJSON(result).error[0]
          window.alert( '[Take Picture] web api error. [' + api_err + ']' );
          callback();
        }
        if( ($.parseJSON(result)).hasOwnProperty('result') ){
          cameras[camID].taken_picture_url = $.parseJSON(result).result;
          console.log( '[actTakePicture] taken picture URL[' + cameras[camID].taken_picture_url + ']' );
          // window.open( cameras[camID].taken_picture_url, '_blank' );
          callback();
        }
      }
    });
    
  };
  
  // Start movie recording.
  // Async Command Block.
  //   camID : Target camera ID.
  ext.startMovieRec = function( camID, callback ) {
    
    console.log( '[startMovieRec] Start, camID[' + camID + '].' );
    
    // Check parameters and some status.
    if( !isValidCameraID( camID ) ){
      window.alert( '[Start Movie Recording] Failed to start movie recording. camID[' + camID + '] is wrong.' );
      callback();
      return;
    }
    
    if( cameras[camID].camera_ctrl_uri == '' ){
      window.alert( '[Start Movie Recording] Failed to start movie recording. uri is not set.' );
      callback();
      return;
    }
    
    if( cameras[camID].shootmode != STRING_SHOOTMODE_MOVIE ){
      window.alert( '[Start Movie Recording] Failed to start movie recording. shoot mode is not [movie].' );
      callback();
      return;
    }
    
    if( cameras[camID].camera_status != STRING_CAMERA_STATUS_IDLE ){
      cameras[camID].queued_func = function(){ ext.startMovieRec( camID, callback ); };
      console.log( '[startMovieRec] Failed to start movie recording. [' + camID + '] status is [' + cameras[camID].camera_status + '].' );
      return;
    }
    
    // Issue startMovieRec API
    $.ajax( cameras[camID].camera_ctrl_uri, { crossDomain: true, type: "POST", dataType: 'text',
                 data: JSON.stringify( { method:"startMovieRec", params:[], id:3 } ) ,
      success: function( result ){
        if( ($.parseJSON(result)).hasOwnProperty('error') ){
          var api_err = $.parseJSON(result).error[0]
          window.alert( '[Start Movie Recording] web api error. [' + api_err + ']' );
        }
        callback();
      }
    });
  };
  
  // Stop movie recording.
  // Async Command Block.
  //   camID : Target camera ID.
  ext.stopMovieRec = function( camID, callback ) {
    
    console.log( '[stopMovieRec] Start, camID[' + camID + '].' );
    
    // Check parameters and some status.
    if( !isValidCameraID( camID ) ){
      window.alert( '[Stop Movie Recording] Failed to stop movie recording. camID[' + camID + '] is wrong.' );
      callback();
      return;
    }
    
    if( cameras[camID].camera_ctrl_uri == '' ){
      window.alert( '[Stop Movie Recording] Failed to stop movie recording. uri is not set.' );
      callback();
      return;
    }
    
    if( cameras[camID].shootmode != STRING_SHOOTMODE_MOVIE ){
      window.alert( '[Stop Movie Recording] Failed to stop movie recording. shoot mode is not [movie].' );
      callback();
      return;
    }
    
    if( cameras[camID].camera_status != STRING_CAMERA_STATUS_MOVIE_RECORDING ){
      cameras[camID].queued_func = function(){ ext.stopMovieRec( camID, callback ); };
      console.log( '[stopMovieRec] Failed to stop movie recording. [' + camID + '] status is [' + cameras[camID].camera_status + '].' );
      return;
    }
    
    // Issue stopMovieRec API
    $.ajax( cameras[camID].camera_ctrl_uri, { crossDomain: true, type: "POST", dataType: 'text',
                 data: JSON.stringify( { method:"stopMovieRec", params:[], id:3 } ) ,
      success: function( result ){
        if( ($.parseJSON(result)).hasOwnProperty('error') ){
          var api_err = $.parseJSON(result).error[0]
          window.alert( '[Stop Movie Recording] web api error. [' + api_err + ']' );
        }
        callback();
      }
    });
  };
  
  // View captured (latest) picture.
  // Sync Command Block.
  //   camID : Target camera ID.
  ext.viewCapturedImage = function( camID ) {
    
    console.log( '[viewCapturedImage] Start, camID[' + camID + '].' );
    
    // Check parameters and some status.
    if( !isValidCameraID( camID ) ){
      window.alert( '[View Captured Image] Failed to view captured image. camID[' + camID + '] is wrong.' );
      return;
    }
    
    if( cameras[camID].taken_picture_url != '' ){
      window.open( cameras[camID].taken_picture_url, '_blank' );
      return;
    }else{
      window.alert( '[View Captured Image] Failed to view captured image. Did you take a picture surely?' );
      return;
    }
    
  };
  
  //
  /* Supplemental functions */
  //  
  // Function on getStatus() API.
  //   camID           : Target camera ID.
  //   longPollingFlag : true  -> issue getEvent(true);  // long polling.
  //                   : false -> issue getEvent(false); // responds immediately.
  function __getStatus( camID, longPollingFlag ){
    
    console.log( '[__getStatus] Start, camID[' + camID + '].' );
    
    // Check parameters and some status.
    if( !isValidCameraID( camID ) ){
      console.log( '[__getStatus] Failed to get Status. camID[' + camID + '] is wrong.' );
      return;
    }
    
    if( cameras[camID].camera_ctrl_uri == '' ){
      console.log( '[__getStatus] Failed to get Status. uri is not set.' );
      return;
    }
    
    // Issue getEvent API.
    // For aborting request of getEvent, we save the ajax obj in the status_req here.
    cameras[camID].status_req =
    $.ajax( cameras[camID].camera_ctrl_uri, { crossDomain: true, type: "POST", dataType: 'text',
                 data: JSON.stringify( { method:"getEvent", params:[longPollingFlag], id:3, version:"1.0"} ) ,
      success: function( result ){
        if( ($.parseJSON(result)).hasOwnProperty('result') ){
          // get Camera Status.
          if( $.parseJSON(result).result[1] != null ){
            if( $.parseJSON(result).result[1].hasOwnProperty('cameraStatus') ){
              cameras[camID].camera_status = $.parseJSON(result).result[1].cameraStatus;
              console.log( '[__getStatus] cameraID [' + camID + '] camera status [' + cameras[camID].camera_status + '].' );
              if( cameras[camID].queued_func != null ){
                cameras[camID].queued_func();
                cameras[camID].queued_func = null;
              }
            }
          }
          // get Camera shoot mode.
          if( $.parseJSON(result).result[21] != null ){
            if( $.parseJSON(result).result[21].hasOwnProperty('currentShootMode') ){
              cameras[camID].shootmode = $.parseJSON(result).result[21].currentShootMode;
              console.log( '[__getStatus] cameraID [' + camID + '] shoot mode [' + cameras[camID].shootmode + '].' );
              if( cameras[camID].queued_func_shootmode != null ){
                if( cameras[camID].queued_func_shootmode( cameras[camID].shootmode ) == 0 ){
                  cameras[camID].queued_func_shootmode = null;
                }
              }
            }
          }
        }
        
        // long polling.
        if( isValidCameraID( camID ) == true ){
          __getStatus( camID, true );
        }
        
      }
    });
    
  }
  
  // Confirm if the camera ID is valid or not.
  //   camID           : Target camera ID.
  function isValidCameraID( camID ){
    
    console.log( '[isValidCameraID] Start, camID[' + camID + '].' );
    console.log( '[isValidCameraID] camID:' + camID + ' is already in array? -> ' + cameras.hasOwnProperty(camID) );
    return cameras.hasOwnProperty(camID);
    
  }
  
  //
  /* Block menu descriptions */
  //  
  var descriptor = {
      blocks: [
        [' ', '%s : Set Camera Control URI : %s', 'setCameraCtrlURI', 'Cam1', 'http://10.0.0.1:10000/sony/camera' ],
        ['r', '%s : Get Shoot Mode', 'getShootMode', 'Cam1'],
        ['w', '%s : Set Shoot Mode : %s', 'setShootMode', 'Cam1', 'Input shoot mode.' ],
        ['r', 'still mode', 'getStillModeValue'],
        ['r', 'movie mode', 'getMovieModeValue'],
        ['r', '%s : Get Camera Status', 'getCameraStatus', 'Cam1'],
        ['r', 'IDLE', 'getIdleValue'],
        ['r', 'MovieRecording', 'getMovieRecordingValue'],
        ['w', '%s : Take Picture', 'actTakePicture', 'Cam1' ],
        ['w', '%s : Start Movie Recording', 'startMovieRec', 'Cam1' ],
        ['w', '%s : Stop Movie Recording', 'stopMovieRec', 'Cam1' ],
        [' ', '%s : View Captured Image', 'viewCapturedImage', 'Cam1' ]
      ]
  };
  
  // Register the extension
  ScratchExtensions.register('Camera Remote API', descriptor, ext);
  
})();
