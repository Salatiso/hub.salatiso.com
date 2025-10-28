# Firebase Android Apps Deployment Specification

## Overview

This specification defines the comprehensive Firebase deployment strategy for all 16 Android applications in the Salatiso Ecosystem. The document establishes consistent configuration, testing workflows, distribution channels, and monitoring practices to ensure seamless deployment and quality assurance across the entire app portfolio.

## Application Inventory

### Production Android Apps (16 Total)

| App Name | Package ID | Firebase Project | Primary Function |
|----------|-----------|------------------|------------------|
| **BizHelp** | `com.salatiso.bizhelp` | `bizhelp-salatiso` | Business operations platform |
| **DocHelp** | `com.salatiso.dochelp` | `dochelp-salatiso` | Document intelligence system |
| **eKhaya** | `com.salatiso.ekhaya` | `ekhaya-salatiso` | Property & tenant management |
| **FamilyValue** | `com.salatiso.familyvalue` | `familyvalue-salatiso` | Family values & governance |
| **FinHelp** | `com.salatiso.finhelp` | `finhelp-salatiso` | Financial management |
| **Flamea** | `com.salatiso.flamea` | `flamea-salatiso` | Advocacy & social justice |
| **HRHelp** | `com.salatiso.hrhelp` | `hrhelp-salatiso` | Human resources management |
| **LegalHelp** | `com.salatiso.legalhelp` | `legalhelp-salatiso` | Legal services platform |
| **LifeSync** | `com.salatiso.lifesync` | `lifesync-salatiso` | Ecosystem hub & coordination |
| **PigeeBack** | `com.salatiso.pigeeback` | `pigeeback-salatiso` | Trust-based ridesharing |
| **PubHelp** | `com.salatiso.pubhelp` | `pubhelp-salatiso` | Publishing & distribution |
| **SafetyHelp** | `com.salatiso.safetyhelp` | `safetyhelp-salatiso` | Safety & compliance |
| **Salatiso.com** | `com.salatiso.salatiso` | `salatiso-main` | Main launchpad app |
| **Sazi.Life Academy** | `com.salatiso.sazilifeacademy` | `sazi-life-academy` | Educational platform |
| **The Hub** | `com.salatiso.thehub` | `thehub-salatiso` | Command center dashboard |

### Web App (1 Total)

| App Name | URL | Firebase Project | Primary Function |
|----------|-----|------------------|------------------|
| **LifeCV** | salatiso-lifecv.web.app | `salatiso-lifecv` | Identity & trust management |

## Firebase Project Architecture

### Multi-Project Strategy

#### Project Organization

```yaml
# Firebase Organization: Salatiso Ecosystem
Organization ID: salatiso-ecosystem

Projects:
  - Primary Infrastructure:
      - salatiso-main (Main launchpad)
      - lifesync-salatiso (Ecosystem hub)
      - salatiso-lifecv (Web identity platform)
  
  - Business Apps:
      - bizhelp-salatiso
      - finhelp-salatiso
      - hrhelp-salatiso
      - legalhelp-salatiso
      - dochelp-salatiso
  
  - Community Apps:
      - safetyhelp-salatiso
      - pigeeback-salatiso
      - flamea-salatiso
      - pubhelp-salatiso
      - familyvalue-salatiso
  
  - Specialized Apps:
      - ekhaya-salatiso
      - sazi-life-academy
      - thehub-salatiso
```

### Shared Firebase Services

#### Services Used Across All Apps

1. **Authentication**: Firebase Auth with custom LifeCV integration
2. **Firestore Database**: Real-time data synchronization
3. **Cloud Storage**: Document and media storage
4. **Cloud Functions**: Backend business logic
5. **Analytics**: User behavior and performance tracking
6. **Crashlytics**: Crash reporting and diagnostics
7. **Performance Monitoring**: App performance metrics
8. **App Distribution**: Testing and beta deployment
9. **Remote Config**: Dynamic feature flags
10. **Cloud Messaging**: Push notifications

## Build Configuration

### Gradle Setup for Firebase

#### Project-Level build.gradle

```groovy
// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    ext {
        kotlin_version = '1.9.20'
        compose_version = '1.5.4'
        firebase_bom_version = '32.7.0'
    }
    
    repositories {
        google()
        mavenCentral()
    }
    
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        classpath 'com.google.gms:google-services:4.4.0'
        classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.9'
        classpath 'com.google.firebase:perf-plugin:1.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

#### App-Level build.gradle Template

```groovy
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'com.google.gms.google-services'
    id 'com.google.firebase.crashlytics'
    id 'com.google.firebase.firebase-perf'
    id 'kotlin-kapt'
    id 'dagger.hilt.android.plugin'
}

android {
    namespace 'com.salatiso.{appname}'
    compileSdk 34

    defaultConfig {
        applicationId "com.salatiso.{appname}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        
        // Firebase configuration
        resValue "string", "default_web_client_id", "${firebaseWebClientId}"
    }

    buildTypes {
        debug {
            debuggable true
            minifyEnabled false
            applicationIdSuffix ".debug"
            versionNameSuffix "-debug"
            
            // Firebase App Distribution
            firebaseAppDistribution {
                releaseNotesFile = "release-notes.txt"
                groups = "internal-testers"
            }
        }

        staging {
            debuggable false
            minifyEnabled true
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            
            firebaseAppDistribution {
                releaseNotesFile = "release-notes.txt"
                groups = "beta-testers"
            }
        }

        release {
            debuggable false
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            
            signingConfig signingConfigs.release
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    buildFeatures {
        compose true
        buildConfig true
    }

    composeOptions {
        kotlinCompilerExtensionVersion compose_version
    }
}

dependencies {
    // Firebase BOM (Bill of Materials)
    implementation platform("com.google.firebase:firebase-bom:${rootProject.ext.firebase_bom_version}")

    // Firebase Services
    implementation 'com.google.firebase:firebase-analytics-ktx'
    implementation 'com.google.firebase:firebase-auth-ktx'
    implementation 'com.google.firebase:firebase-firestore-ktx'
    implementation 'com.google.firebase:firebase-storage-ktx'
    implementation 'com.google.firebase:firebase-crashlytics-ktx'
    implementation 'com.google.firebase:firebase-perf-ktx'
    implementation 'com.google.firebase:firebase-config-ktx'
    implementation 'com.google.firebase:firebase-messaging-ktx'
    implementation 'com.google.firebase:firebase-functions-ktx'

    // Kotlin & AndroidX
    implementation "androidx.core:core-ktx:1.12.0"
    implementation "androidx.lifecycle:lifecycle-runtime-ktx:2.7.0"
    implementation "androidx.activity:activity-compose:1.8.2"

    // Jetpack Compose
    implementation "androidx.compose.ui:ui:${rootProject.ext.compose_version}"
    implementation "androidx.compose.material3:material3:1.1.2"
    implementation "androidx.compose.ui:ui-tooling-preview:${rootProject.ext.compose_version}"

    // Dependency Injection
    implementation "com.google.dagger:hilt-android:2.48"
    kapt "com.google.dagger:hilt-compiler:2.48"

    // Sonny SDK (Custom)
    implementation project(':sonny-sdk')

    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}

// Apply Google Services plugin at the end
apply plugin: 'com.google.gms.google-services'
```

### Firebase Configuration Files

#### google-services.json Placement

```
app/
├── src/
│   ├── debug/
│   │   └── google-services.json       # Debug configuration
│   ├── staging/
│   │   └── google-services.json       # Staging configuration
│   └── release/
│       └── google-services.json       # Production configuration
```

#### Configuration Management

```bash
# Generate google-services.json for each environment
# Debug environment
firebase apps:sdkconfig android com.salatiso.{appname}.debug \
  --project={firebase-project-debug} > app/src/debug/google-services.json

# Staging environment
firebase apps:sdkconfig android com.salatiso.{appname}.staging \
  --project={firebase-project-staging} > app/src/staging/google-services.json

# Production environment
firebase apps:sdkconfig android com.salatiso.{appname} \
  --project={firebase-project} > app/src/release/google-services.json
```

## Firebase Initialization

### Application-Level Setup

```kotlin
// SalatisoApplication.kt
@HiltAndroidApp
class SalatisoApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        
        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        
        // Configure Crashlytics
        configureCrashlytics()
        
        // Configure Analytics
        configureAnalytics()
        
        // Configure Performance Monitoring
        configurePerformance()
        
        // Configure Remote Config
        configureRemoteConfig()
        
        // Initialize Sonny SDK
        initializeSonnySDK()
    }

    private fun configureCrashlytics() {
        FirebaseCrashlytics.getInstance().apply {
            setCrashlyticsCollectionEnabled(!BuildConfig.DEBUG)
            setUserId(getCurrentUserId())
            setCustomKey("app_name", BuildConfig.APPLICATION_ID)
            setCustomKey("build_type", BuildConfig.BUILD_TYPE)
        }
    }

    private fun configureAnalytics() {
        FirebaseAnalytics.getInstance(this).apply {
            setAnalyticsCollectionEnabled(true)
            setUserId(getCurrentUserId())
            setUserProperty("app_version", BuildConfig.VERSION_NAME)
            setUserProperty("ecosystem_member", "true")
        }
    }

    private fun configurePerformance() {
        FirebasePerformance.getInstance().apply {
            isPerformanceCollectionEnabled = !BuildConfig.DEBUG
        }
    }

    private fun configureRemoteConfig() {
        FirebaseRemoteConfig.getInstance().apply {
            setConfigSettingsAsync(
                remoteConfigSettings {
                    minimumFetchIntervalInSeconds = if (BuildConfig.DEBUG) 0 else 3600
                }
            )
            setDefaultsAsync(R.xml.remote_config_defaults)
            fetchAndActivate()
        }
    }

    private fun initializeSonnySDK() {
        SonnySDK.initialize(
            context = this,
            config = SonnyConfig(
                firebaseAuth = FirebaseAuth.getInstance(),
                firestore = FirebaseFirestore.getInstance(),
                offlineMode = true
            )
        )
    }
}
```

## App Distribution Setup

### Firebase App Distribution Configuration

#### Distribution Groups

```yaml
# Tester Groups Configuration
Groups:
  internal-testers:
    description: "Core development team"
    members:
      - salatiso@mlandeni-notemba.co.za
      - visa@mlandeni-notemba.co.za
      - kwakho@mlandeni-notemba.co.za
      - tina@mlandeni-notemba.co.za
      - solo@mlandeni-notemba.co.za
  
  beta-testers:
    description: "Extended testing community"
    members:
      - internal-testers (inherited)
      - family-circle@salatiso.com
      - community-testers@salatiso.com
  
  production-testers:
    description: "Pre-production validation"
    members:
      - beta-testers (inherited)
      - partners@salatiso.com
      - stakeholders@salatiso.com
```

#### Distribution Automation

```groovy
// Gradle task for automated distribution
task distributeToTesters(type: Exec) {
    def appId = project.hasProperty('appId') ? project.property('appId') : 'com.salatiso.{appname}'
    def groups = project.hasProperty('groups') ? project.property('groups') : 'internal-testers'
    def releaseNotes = project.hasProperty('releaseNotes') ? project.property('releaseNotes') : 'New test build'

    commandLine 'firebase', 'appdistribution:distribute',
        'app/build/outputs/apk/debug/app-debug.apk',
        '--app', appId,
        '--groups', groups,
        '--release-notes', releaseNotes
}
```

### GitHub Actions CI/CD Pipeline

#### Automated Build and Distribution

```yaml
# .github/workflows/firebase-deploy.yml
name: Firebase Android Deployment

on:
  push:
    branches: [ develop, staging, main ]
  pull_request:
    branches: [ develop, staging, main ]

jobs:
  build-and-distribute:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        app: [
          'bizhelp', 'dochelp', 'ekhaya', 'familyvalue',
          'finhelp', 'flamea', 'hrhelp', 'legalhelp',
          'lifesync', 'pigeeback', 'pubhelp', 'safetyhelp',
          'salatiso', 'sazilifeacademy', 'thehub'
        ]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Cache Gradle packages
        uses: actions/cache@v3
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: |
            ${{ runner.os }}-gradle-

      - name: Decode google-services.json
        env:
          GOOGLE_SERVICES_JSON: ${{ secrets[format('GOOGLE_SERVICES_JSON_{0}', matrix.app)] }}
        run: echo $GOOGLE_SERVICES_JSON | base64 --decode > app/google-services.json

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew :${{ matrix.app }}:assembleDebug

      - name: Distribute to Firebase
        uses: wzieba/Firebase-Distribution-Github-Action@v1
        with:
          appId: ${{ secrets[format('FIREBASE_APP_ID_{0}', matrix.app)] }}
          serviceCredentialsFileContent: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          groups: internal-testers
          file: app/build/outputs/apk/debug/app-debug.apk
          releaseNotes: |
            Automated build from ${{ github.ref_name }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}

      - name: Upload Build Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.app }}-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
```

## Testing Strategy

### Firebase Test Lab Integration

#### Automated Device Testing

```yaml
# test-lab-config.yml
deviceMatrix:
  - model: flame         # Pixel 4
    version: 30          # Android 11
    locale: en_ZA
    orientation: portrait
  
  - model: redfin        # Pixel 5
    version: 31          # Android 12
    locale: en_ZA
    orientation: portrait
  
  - model: panther       # Pixel 7
    version: 33          # Android 13
    locale: en_ZA
    orientation: portrait

testTimeout: 30m
testSetup:
  account:
    googleAutoLogin: true
  environmentVariables:
    - key: ENV
      value: staging
```

#### Test Execution Script

```bash
#!/bin/bash
# firebase-test-lab.sh

APPS=(
  "bizhelp" "dochelp" "ekhaya" "familyvalue"
  "finhelp" "flamea" "hrhelp" "legalhelp"
  "lifesync" "pigeeback" "pubhelp" "safetyhelp"
  "salatiso" "sazilifeacademy" "thehub"
)

for app in "${APPS[@]}"; do
  echo "Testing $app on Firebase Test Lab..."
  
  gcloud firebase test android run \
    --type instrumentation \
    --app "app/build/outputs/apk/debug/${app}-debug.apk" \
    --test "app/build/outputs/apk/androidTest/debug/${app}-debug-androidTest.apk" \
    --device model=flame,version=30,locale=en_ZA,orientation=portrait \
    --timeout 30m \
    --results-bucket="gs://salatiso-test-results" \
    --results-dir="${app}-$(date +%Y%m%d-%H%M%S)"
done
```

### Manual Testing Checklist

#### Pre-Distribution Verification

- [ ] App builds successfully for all variants (debug, staging, release)
- [ ] Firebase services initialize correctly
- [ ] Authentication flow works with LifeCV integration
- [ ] Offline functionality operates as expected
- [ ] Sonny trust features integrate properly
- [ ] Five-Level Progression system functions correctly
- [ ] Cross-app navigation and deep linking work
- [ ] Crashlytics reports test crashes
- [ ] Analytics events fire correctly
- [ ] Remote Config updates apply dynamically

## Monitoring and Analytics

### Firebase Analytics Events

#### Standard Events for All Apps

```kotlin
// Analytics tracking helper
object AnalyticsTracker {

    private val analytics = FirebaseAnalytics.getInstance(context)

    // App lifecycle events
    fun trackAppOpen() {
        analytics.logEvent(FirebaseAnalytics.Event.APP_OPEN, null)
    }

    fun trackScreenView(screenName: String, screenClass: String) {
        analytics.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW) {
            param(FirebaseAnalytics.Param.SCREEN_NAME, screenName)
            param(FirebaseAnalytics.Param.SCREEN_CLASS, screenClass)
        }
    }

    // Ecosystem events
    fun trackEcosystemInteraction(targetApp: String, action: String) {
        analytics.logEvent("ecosystem_interaction") {
            param("target_app", targetApp)
            param("action", action)
            param("timestamp", System.currentTimeMillis())
        }
    }

    // Trust events
    fun trackTrustEvent(eventType: String, trustScore: Int) {
        analytics.logEvent("trust_event") {
            param("event_type", eventType)
            param("trust_score", trustScore.toLong())
            param("sonny_version", SonnySDK.VERSION)
        }
    }

    // Offline events
    fun trackOfflineSync(syncDuration: Long, recordCount: Int) {
        analytics.logEvent("offline_sync") {
            param("duration_ms", syncDuration)
            param("record_count", recordCount.toLong())
            param("network_type", getNetworkType())
        }
    }
}
```

### Crashlytics Custom Keys

```kotlin
// Crashlytics configuration
object CrashlyticsConfig {

    private val crashlytics = FirebaseCrashlytics.getInstance()

    fun configureForUser(userId: String, userName: String) {
        crashlytics.setUserId(userId)
        crashlytics.setCustomKey("user_name", userName)
        crashlytics.setCustomKey("app_package", BuildConfig.APPLICATION_ID)
        crashlytics.setCustomKey("app_version", BuildConfig.VERSION_NAME)
        crashlytics.setCustomKey("sonny_enabled", SonnySDK.isEnabled())
    }

    fun logBreadcrumb(message: String) {
        crashlytics.log("${System.currentTimeMillis()}: $message")
    }

    fun recordException(throwable: Throwable, context: Map<String, Any>) {
        context.forEach { (key, value) ->
            crashlytics.setCustomKey(key, value.toString())
        }
        crashlytics.recordException(throwable)
    }
}
```

## Security and Compliance

### Firebase Security Rules

#### Firestore Rules Template

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function hasTrustLevel(minLevel) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.trustScore >= minLevel;
    }
    
    function isEcosystemApp() {
      return request.auth.token.ecosystem_member == true;
    }
    
    // User data (private)
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
    
    // Trust data (Sonny)
    match /trust/{trustId} {
      allow read: if hasTrustLevel(50);
      allow write: if isAuthenticated() && isEcosystemApp();
    }
    
    // Shared ecosystem data
    match /ecosystem/{document=**} {
      allow read: if isAuthenticated();
      allow write: if hasTrustLevel(70) && isEcosystemApp();
    }
    
    // Public content
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

#### Cloud Storage Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // User uploads
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    // Shared documents
    match /shared/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.auth.token.trustScore >= 60;
    }
    
    // Public assets
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### App Signing Configuration

#### Signing Configs

```groovy
android {
    signingConfigs {
        debug {
            storeFile file("../keystores/debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }

        staging {
            storeFile file("../keystores/staging.keystore")
            storePassword System.getenv("STAGING_KEYSTORE_PASSWORD")
            keyAlias System.getenv("STAGING_KEY_ALIAS")
            keyPassword System.getenv("STAGING_KEY_PASSWORD")
        }

        release {
            storeFile file("../keystores/release.keystore")
            storePassword System.getenv("RELEASE_KEYSTORE_PASSWORD")
            keyAlias System.getenv("RELEASE_KEY_ALIAS")
            keyPassword System.getenv("RELEASE_KEY_PASSWORD")
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        staging {
            signingConfig signingConfigs.staging
        }
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## Deployment Workflow

### Release Process

#### 1. Development Phase
```bash
# Build debug version
./gradlew assembleDebug

# Distribute to internal testers
firebase appdistribution:distribute app/build/outputs/apk/debug/app-debug.apk \
  --app [FIREBASE_APP_ID] \
  --groups internal-testers \
  --release-notes "Development build - $(git log -1 --pretty=%B)"
```

#### 2. Staging Phase
```bash
# Build staging version
./gradlew assembleStaging

# Run automated tests
./gradlew testStagingUnitTest
./gradlew connectedStagingAndroidTest

# Distribute to beta testers
firebase appdistribution:distribute app/build/outputs/apk/staging/app-staging.apk \
  --app [FIREBASE_APP_ID] \
  --groups beta-testers \
  --release-notes-file release-notes.txt
```

#### 3. Production Phase
```bash
# Build release version
./gradlew assembleRelease

# Run full test suite
./gradlew test
./gradlew connectedAndroidTest

# Upload to Play Console (via Gradle Play Publisher)
./gradlew publishReleaseBundle

# Create Firebase distribution for production testers
firebase appdistribution:distribute app/build/outputs/apk/release/app-release.apk \
  --app [FIREBASE_APP_ID] \
  --groups production-testers \
  --release-notes-file production-release-notes.txt
```

### Multi-App Deployment Script

```bash
#!/bin/bash
# deploy-all-apps.sh

APPS=(
  "bizhelp:1a2b3c4d5e6f"
  "dochelp:2b3c4d5e6f7g"
  "ekhaya:3c4d5e6f7g8h"
  "familyvalue:4d5e6f7g8h9i"
  "finhelp:5e6f7g8h9i0j"
  "flamea:6f7g8h9i0j1k"
  "hrhelp:7g8h9i0j1k2l"
  "legalhelp:8h9i0j1k2l3m"
  "lifesync:9i0j1k2l3m4n"
  "pigeeback:0j1k2l3m4n5o"
  "pubhelp:1k2l3m4n5o6p"
  "safetyhelp:2l3m4n5o6p7q"
  "salatiso:3m4n5o6p7q8r"
  "sazilifeacademy:4n5o6p7q8r9s"
  "thehub:5o6p7q8r9s0t"
)

BUILD_TYPE=${1:-debug}
TESTER_GROUP=${2:-internal-testers}

for app_info in "${APPS[@]}"; do
  IFS=':' read -r app_name firebase_id <<< "$app_info"
  
  echo "================================================"
  echo "Deploying $app_name ($BUILD_TYPE)"
  echo "================================================"
  
  # Navigate to app directory
  cd "Android Apps/${app_name^}-Android-App" || continue
  
  # Build APK
  ./gradlew assemble${BUILD_TYPE^}
  
  # Distribute to Firebase
  firebase appdistribution:distribute \
    "app/build/outputs/apk/${BUILD_TYPE}/app-${BUILD_TYPE}.apk" \
    --app "$firebase_id" \
    --groups "$TESTER_GROUP" \
    --release-notes "Batch deployment - ${BUILD_TYPE} - $(date)"
  
  echo "✓ $app_name deployed successfully"
  echo ""
  
  # Return to root
  cd ../..
done

echo "================================================"
echo "All apps deployed successfully!"
echo "================================================"
```

## Performance Optimization

### Remote Config for A/B Testing

```kotlin
// Remote Config setup
class FeatureFlagManager {

    private val remoteConfig = FirebaseRemoteConfig.getInstance()

    suspend fun initialize() {
        remoteConfig.setConfigSettingsAsync(
            remoteConfigSettings {
                minimumFetchIntervalInSeconds = 3600
            }
        )
        
        remoteConfig.setDefaultsAsync(mapOf(
            "enable_sonny_mesh" to true,
            "trust_score_threshold" to 50,
            "offline_sync_interval" to 300,
            "show_ecosystem_navigator" to true,
            "enable_advanced_features" to false
        ))
        
        remoteConfig.fetchAndActivate().await()
    }

    fun isSonnyMeshEnabled(): Boolean {
        return remoteConfig.getBoolean("enable_sonny_mesh")
    }

    fun getTrustScoreThreshold(): Int {
        return remoteConfig.getLong("trust_score_threshold").toInt()
    }
}
```

### Performance Monitoring Traces

```kotlin
// Performance monitoring
class PerformanceTracker {

    fun trackOperation(operationName: String, operation: () -> Unit) {
        val trace = FirebasePerformance.getInstance().newTrace(operationName)
        trace.start()
        
        try {
            operation()
            trace.putAttribute("status", "success")
        } catch (e: Exception) {
            trace.putAttribute("status", "error")
            trace.putAttribute("error_message", e.message ?: "Unknown")
            throw e
        } finally {
            trace.stop()
        }
    }

    suspend fun <T> trackSuspendOperation(
        operationName: String,
        operation: suspend () -> T
    ): T {
        val trace = FirebasePerformance.getInstance().newTrace(operationName)
        trace.start()
        
        return try {
            val result = operation()
            trace.putAttribute("status", "success")
            result
        } catch (e: Exception) {
            trace.putAttribute("status", "error")
            trace.putAttribute("error_message", e.message ?: "Unknown")
            throw e
        } finally {
            trace.stop()
        }
    }
}
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: google-services.json Not Found
```bash
# Solution: Ensure file is in correct location
app/
├── src/
│   └── [buildType]/
│       └── google-services.json

# Verify with:
ls -la app/src/debug/google-services.json
```

#### Issue: Firebase Initialization Failure
```kotlin
// Solution: Check initialization order
override fun onCreate() {
    super.onCreate()
    
    // Initialize Firebase first
    FirebaseApp.initializeApp(this)
    
    // Then initialize dependent services
    initializeOtherServices()
}
```

#### Issue: App Distribution Upload Fails
```bash
# Solution: Verify Firebase CLI authentication
firebase login:ci

# Generate token for CI/CD
firebase login:ci --no-localhost

# Use token in CI/CD
export FIREBASE_TOKEN="your-token-here"
```

## Success Metrics

### Key Performance Indicators

- **Build Success Rate**: >95% for all apps
- **Distribution Time**: <10 minutes per app
- **Test Pass Rate**: >90% on Firebase Test Lab
- **Crash-Free Users**: >99.5% across all apps
- **App Performance Score**: >85 on Firebase Performance
- **Tester Feedback Response**: <24 hours turnaround

### Monitoring Dashboard

```markdown
# Firebase Deployment Dashboard

## Build Status (Last 24 Hours)
- ✓ BizHelp: 5/5 successful
- ✓ DocHelp: 5/5 successful
- ✓ eKhaya: 4/5 successful (1 retry)
- ... (all apps)

## Distribution Metrics
- Total Distributions: 75
- Average Distribution Time: 8.5 minutes
- Tester Adoption Rate: 87%

## Test Lab Results
- Total Tests Run: 450
- Pass Rate: 94%
- Average Test Duration: 12 minutes

## Crash Analytics
- Crash-Free Users: 99.7%
- Top Issues: 3 identified
- Resolution Time: 2.3 days average
```

---

*This specification provides comprehensive guidance for deploying all 16 Android apps to Firebase for testing, ensuring consistent quality, security, and monitoring across the entire Salatiso Ecosystem.*