var GCM_SENDER_ID = 0
/**
 * Implements hook_deviceready().
 */
function push_notifications_deviceready() {
  try {
    // When the device is connected, if the user is anonymous we don't want to register a token
    if (Drupal.user.uid == 0) {
      return;
    } else {

    }
  }
  catch (error) {
    console.log('push_notifications_deviceready - ' + error);
  }
}
function push_notifications_tokenHandler(result) {
  var push_token = localStorage.getItem('push_token');
  if (push_token === null || push_token != result) {
    console.log('jere');
  }
}

function push_notifications_register() {
  var pushNotification;
  pushNotification = window.plugins.pushNotification;
  if (device.platform == 'android' || device.platform == 'Android') {
    pushNotification.register(push_notifications_successHandler, push_notifications_errorHandler, {"senderID": GCM_SENDER_ID, "ecb": "onNotificationGCM"});
  } else {
    pushNotification.register(push_notifications_tokenHandler, push_notifications_errorHandler, {"badge": "false", "sound": "true", "alert": "true", "ecb": "onNotificationAPN"});
  }
}
/**
 * Implements hook_services_postprocess().
 */
function push_notifications_services_postprocess(options, result) {
  try {
    // When the user login service resource is successful store a token
    if (options.service == 'user') {
      if (options.resource == 'login') {
        // store
      }
      else if (options.resource == 'logout') {
        // delete
      }
    }
  }
  catch (error) {
    console('push_notifications_services_postprocess - ' + error);
  }
}

function push_notifications_successHandler(result) {

}
function push_notifications_errorHandler(error) {
}

function onNotificationGCM(e) {
  switch (e.event)
  {
    case 'registered':
      if (e.regid.length > 0) {

      }
      break;
    case 'message':
      break;
    case 'error':
      break;
    default:
      break;
  }
}

function onNotificationAPN(event) {
  if (event.alert) {
  }
  if (event.sound) {
    //navigator.notification.vibrate(2000);
  }
}