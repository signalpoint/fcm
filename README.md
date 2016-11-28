# fcm

The Firebase Cloud Messaging module for DrupalGap helps users to send cloud messages from their Drupal website to devices.

## Installation

Before getting started, make sure you're running the latest versions of:

- PhoneGap/Cordova
- Android SDK(s)
- iOS/xCode

### Push Notifications Module for DrupalGap

First, download and extract this module so it lives here:

`app/modules/fcm`

Add it to the `settings.js` file:

`Drupal.modules.contrib['fcm'] = {};`

### Google Firebase Cloud Messaging Cordova Push Plugin

Then install the `Google Firebase Cloud Messaging Cordova Push Plugin`

https://github.com/fechanique/cordova-plugin-fcm

```
cordova plugin add cordova-plugin-fcm
cordova plugin save
```

### Setting up a Platform(s)

Next, follow these steps for your desired platform(s):

#### Android

1. Go to https://console.cloud.google.com/home/dashboard
2. Create a new project (or use an existing one)
3. On the `Dashboard`, click `Enable and manage APIs`
4. Enable the `Google Cloud Messaging` for Android API
5. Once enabled, click `Go to Credentials`
6. Under `Where will you be calling the API from?` choose `Web server`
7. Click `What credentials do I need?`
8. Enter a `Name` for your web server
9. Click `Create API key`
10. Copy the API key and set it aside

#### iOS

> High level overview

```
cd ~/Desktop
openssl pkcs12 -clcerts -nokeys -out apns-dev-cert.pem -in apns-dev-cert.p12 
openssl pkcs12 -nocerts -out apns-dev-key.pem -in apns-dev-key.p12 
cat apns-dev-cert.pem apns-dev-key.pem > apns-dev.pem
scp apns-dev.pem me@example.com:~/
```

### Push Notifications Module for Drupal

1. Download and enable the Push Notifications module for Drupal: https://www.drupal.org/project/push_notifications
2. In Drupal, go to `admin/config/services/push_notifications/configure`
3. For Android, paste in the API key you generated earlier into this form
4. Click `Save configuration`
5. Go to `admin/structure/services/list/drupalgap/resources`
6. Check the box next to `push_notifications` to enable its `create` and `delete` resources
7. Click `Save`
8. Flush all of Drupal's caches

#### Module Permissions in Drupal

1. Go to `admin/people/permissions` in Drupal
2. Go to the `Push Notifications` section
3. Grant permission to `Register device token` and `Remove device token` to your desired user role(s), we recommend giving this permission to both anonymous and authenticated users

Next, we'll head back to the Google Cloud Platform API (if you're working with Android)...

### Get an Android Sender ID

1. Go to https://console.cloud.google.com
2. On the `Dashboard`, click `Enable and manage APIs`
3. Click on the `Credentials` button in the sidebar menu for your project
4. Click the `Create credentials` button
5. Select `API key`
6. Click `Android key`
7. Enter a `Name` for your key, e.g. `example.com`
8. Click the `+ Add package name and fingerprint` button
9. Enter the `Package name`, which can be found as the value of the `package` attribute in the `manifest` element in the `AndroidManifest.xml` file
10. Open a terminal window and navigate to the root of your cordova project
11. Run this command: `keytool -genkey -v -keystore example.keystore -alias example -keyalg RSA -keysize 2048 -validity 10000`
12. Follow all the prompts and take note of the password you enter, because you'll need it later
13. Run this command: `keytool -exportcert -alias example -keystore example.keystore -list -v`
14. Copy the `SHA1` fingerprint
15. Go back to the Google window and paste in the `SHA1` fingerprint
16. Click `Create`, then copy the API key that is shown

Next, get the `senderID` by...

1. Go to https://console.developers.google.com/apis/library
2. Under the drop down menu, click `Manage all projects`
3. Click on your project's name
4. Click on `Settings` in the left sidebar
5. Copy the `Project number`, this will go into your `settings.js` file as the `senderID` for Android.

#### Android Quirks

You may have to run this command if you're having issues building for an Android device:

```
android update sdk --no-ui --filter "extra"
```

#### iOS Quirks

You'll need to be running at least `cordova-ios@4.0.1` to get the build to compile properly for iOS. To see your current version of the iOS platform:

```
cordova platform ios
```

Then if it isn't running at least `4.0.1`, then run this command:

```
cordova platform update ios@4.0.1
```

## Usage

### Sending a Push Notification

In Drupal, first go to `admin/config/services/push_notifications` and verify that a token has been registered for your
desired device(s). If there is a token registered, then go to  `admin/config/services/push_notifications/message` and
fill out the form to send a push notification to your desired platform(s).

### Receiving a Push Notification

To handle the receipt of a push notification, implement this hook in your custom DrupalGap module's `.js` file:

```
/**
 * Implements hook_push_notifications_receive().
 **/
function my_module_push_notifications_receive(data) {

  // data.message
  // data.title
  // data.count
  // data.sound
  // data.image
  // data.additionalData
  
  // Display the push notification.
  drupalgap_alert(data.message, {
    title: drupalgap.settings.title,
    buttonName: 'OK'
  });
  
}
```

When a push notifications is received, developers can take action as they need. The example above simply shows the push notification in an alert dialog.

## Real World Examples

### Send a push notification to display a node

In this example, a Drupal admin will be able to send a push notification that when clicked by the end user will display a particular node in the app.

In a custom Drupal module, alter the push notifications form so you can include a node id in the message payload:

```
/**
 * Implements hook_form_alter().
 */
function example_form_alter(&$form, $form_state, $form_id) {
  switch ($form_id) {
    case 'push_notifications_mass_push_form':
      $form['message']['nid'] = array(
        '#type' => 'textfield',
        '#title' => t('Node ID'),
        '#description' => t('Enter a the id of a node to display to the recipients.'),
        '#size' => 6
      );
      break;
  }
}
```

Now in a custom DrupalGap module, take action when the push notification is received and send the user to view the node in the app:

```
/**
 * Implements hook_fcm_receive().
 */
function example_fcm_receive(data) {
  //if (data.additionalData && data.additionalData.nid) {
  //  drupalgap_goto('node/' + data.additionalData.nid);
  //}
  if(data.wasTapped){
    // Notification was received on device tray and tapped by the user.
    alert( JSON.stringify(data) );
  }
  else{
    // Notification was received in foreground. Maybe the user needs to be notified.
    alert( JSON.stringify(data) );
  }
}
```

That's it! Now when a user clicks the push notification on their device, it'll open the app and display the node.
