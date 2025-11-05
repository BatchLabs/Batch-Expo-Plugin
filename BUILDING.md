## How to develop

This guide will walk you through setting up your development environment and running the example application.

### Install dependencies

First, you need to install the necessary dependencies for the main project. Run the following command in the root directory:

```shell
  npm install
```

### Set Up and Run the Example App

The `example` directory contains a sample application to test and showcase the project's features.

#### Navigate to the Example Directory

Change your current directory to the example folder:

```shell
  cd example
```

#### Install Example App Dependencies

Install apps dependencies

```shell
  npm install
```

#### Generate native projects

To run the app on a simulator or a physical device, you need to generate the native iOS and Android project files. Use the following command to do so, which also cleans the previous ios/android folder:

> **Warning**: Running this command outside the `example` folder will delete the plugin's ios and android directories.

```shell
    npx expo prebuild --clean
```

#### Run the Application

- To run on Android:

```shell
    npx expo run:android
```

- To run on iOS:

```shell
    npx expo run:ios
```


