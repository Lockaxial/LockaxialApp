cd android\app\src\main
mkdir assets
cd ../../../../

react-native bundle --entry-file index.android.js --bundle-output ./android/app/src/main/assets/index.android.bundle --platform android --assets-dest ./android/app/src/main/res/ --dev false