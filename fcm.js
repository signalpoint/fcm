var push = null;

function fcm_register() {

  // Get the token.
  FCMPlugin.getToken(
      function(token){
        console.log('getToken', token);
        fcm_register_device_token(token);
      },
      function(err){
        console.log('error retrieving token: ' + err);
      }
  );

  // Handle the receipt of a notification.
  FCMPlugin.onNotification(
      function(data){
        console.log('onNotification', data);
        module_invoke_all('fcm_receive', data);
      },
      function(msg){
        console.log('onNotification callback successfully registered: ' + msg);
      },
      function(err){
        console.log('Error registering onNotification callback: ' + err);
      }
  );

}
/**
 * Implements hook_services_postprocess().
 */
function fcm_services_postprocess(options, result) {
  try {
    if (drupalgap.settings.mode != 'phonegap') { return; }
    // When a user is connected and is allowed to register a token, do it.
    if (options.service == 'system' && options.resource == 'connect' && user_access('register device token')) {
      fcm_register();
    }
  }
  catch (error) {
    console.log('fcm_services_postprocess - ' + error);
  }
}

/**
 * Implements hook_services_preprocess().
 */
function fcm_services_preprocess(options, result) {
  try {
    if (drupalgap.settings.mode != 'phonegap') { return; }
    // When a user logs out and is allowed to delete a token, do it.
    if (options.service == 'user' && options.resource == 'logout' && user_access('remove device token')) {
      fcm_delete_device_token();
    }
  }
  catch (error) {
    console.log('fcm_services_preprocess - ' + error);
  }
}


function fcm_register_device_token(token) {
  var push_token = variable_get('fcm_token', null);
  console.log('fcm_token', push_token);
  if (push_token === null || push_token != token) {
    var data = {
      'token': token,
      'type': fcm_platform_token(device.platform)
    };
    // give other modules a chance to react to registering a push notification
    module_invoke_all('fcm_register');
    fcm_create(data, {
      success: function(result) {
        console.log('fcm_create', result);
        if (result['success'] == 1) {
          variable_set("fcm_token", token);
        }
      }
    });
  }
}

function fcm_delete_device_token() {
  var push_token = variable_get('fcm_token', null);
  if (push_token != null) {
    fcm_delete(push_token, {
      success: function(result) {
        console.log('fcm_delete', result);
        if (result['success'] == 1) {
          variable_del("fcm_token");
        }
      }
    });
  }
}

function fcm_create(data, options) {
  try {
    options.method = 'POST';
    options.path = 'push_notifications.json';
    options.service = 'push_notifications';
    options.resource = 'create';
    options.data = JSON.stringify(data);
    Drupal.services.call(options);
  }
  catch (error) {
    console.log('fcm_create - ' + data);
  }
}
function fcm_delete(token, options) {
  try {
    options.method = 'DELETE';
    options.path = 'push_notifications/' + token + '.json';
    options.service = 'push_notifications';
    options.resource = 'delete';
    Drupal.services.call(options);
  }
  catch (error) {
    console.log('fcm_delete - ' + token);
  }
}

function fcm_platform_token(platform) {
  var token;
  switch (platform) {
    case "iOS":
      token = 'ios';
      break;
    case "Android":
      token = 'android';
      break;
    default:
      token = null;
      break;
  }
  return token;
}
