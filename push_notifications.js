var push = null;

function push_notifications_register() {

  // Initializes the plugin.
  push = PushNotification.init(drupalgap.settings.push_notifications);

  // Set up the registration, notification and error handlers.
  push.on('registration', function(data) {
    push_notifications_register_device_token(data.registrationId);
  });

  // Handle the receipt of a notification.
  push.on('notification', function(data) {
    module_invoke_all('push_notifications_receive', data);
  });

  push.on('error', function(e) { drupalgap_alert(e.message); });
}
/**
 * Implements hook_services_postprocess().
 */
function push_notifications_services_postprocess(options, result) {
  try {
    if (drupalgap.settings.mode != 'phonegap') { return; }
    // When a user is connected and is allowed to register a token, do it.
    if (options.service == 'system' && options.resource == 'connect' && user_access('register device token')) {
      push_notifications_register();
    }
    // When a user logs out and is allowed to delete a token, do it.
    else if (options.service == 'user' && options.resource == 'logout' && user_access('remove device token')) {
      push_notifications_delete_device_token();
    }
  }
  catch (error) {
    console.log('push_notifications_services_postprocess - ' + error);
  }
}

function push_notifications_register_device_token(token) {
  var push_token = localStorage.getItem('push_notifications_token');
  if (push_token === null || push_token != token) {
    var data = {
      'token': token,
      'type': push_notifications_platform_token(device.platform)
    };
    // give other modules a chance to react to registering a push notification
    module_invoke_all('push_notifications_register');
    push_notifications_create(data, {
      success: function(result) {
        if (result['success'] == 1) {
          localStorage.setItem("push_notifications_token", token);
        }
      }
    });
  }
}

function push_notifications_delete_device_token() {
  var push_token = localStorage.getItem('push_notifications_token');
  if (push_token != null) {
    push_notifications_delete(push_token, {
      success: function(result) {
        if (result['success'] == 1) {
          window.localStorage.removeItem("push_notifications_token");
        }
      }
    });
  }
}

function push_notifications_create(data, options) {
  try {
    options.method = 'POST';
    options.path = 'push_notifications';
    options.service = 'push_notifications';
    options.resource = 'push_notifications';
    options.data = JSON.stringify(data);
    Drupal.services.call(options);
  }
  catch (error) {
    console.log('push_notifications_create - ' + data);
  }
}
function push_notifications_delete(token, options) {
  try {
    options.method = 'DELETE';
    options.path = 'push_notifications/' + token;
    options.service = 'push_notifications';
    options.resource = 'push_notifications';
    Drupal.services.call(options);
  }
  catch (error) {
    console.log('push_notifications_delete - ' + token);
  }
}

function push_notifications_platform_token(platform) {
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
