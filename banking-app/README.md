# MyBanking App

A banking application built with Angular and Firebase that allows users to manage accounts and transfer funds.

## Prerequisites

Before running this project, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or above)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- A [Firebase](https://console.firebase.google.com) account

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project** and follow the steps
3. Once created, go to **Project Settings** → **Your Apps** → click the web icon (`</>`) to register a web app
4. Copy the Firebase config object shown — you'll need it in the next step
5. In the Firebase console, enable the following:
   - **Authentication** → Sign-in method → Email/Password
   - **Firestore Database** → Create database → Start in test mode

## Installation & Setup

**1. Clone the repository**
```bash
git clone <repo-url>
cd banking-app-takehome/banking-app
```

**2. Install dependencies**
```bash
npm install
```

**3. Create environment files**
```bash
cp src/environments/environment.example.ts src/environments/environment.development.ts
cp src/environments/environment.example.ts src/environments/environment.ts
```

**4. Fill in your Firebase config**

Open both `environment.development.ts` and `environment.ts` and replace the placeholder values with your Firebase config:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'your-actual-api-key',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
  }
};
```

**5. Build and Run the app**
```bash
ng build
ng serve
```

Open your browser and navigate to `http://localhost:4200`

## Running Tests
I have used Jest framework to write tests for this application.
```bash
npm uninstall karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
npm install --save-dev jest @types/jest jest-preset-angular ts-jest --legacy-peer-deps
```
Create setup-jest.ts file in the root folder. Inside the file:
```bash
import 'jest-preset-angular/setup-jest';
```
Create jest.config.ts in the root folder.
```
    import type { Config } from 'jest';

    const config: Config = {
    preset: 'jest-preset-angular',
    setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
        'jest-preset-angular',
        {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            stringifyContentPathRegex: '\\.html$',
        }
        ]
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    testPathPattern: ['\\.spec\\.ts$']
    };

    export default config;
```
Update tsconfig.jest.json file
```
    /* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
    /* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
    {
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "outDir": "./out-tsc/spec",
        "types": [
        "jest"
        ]
    },
    "include": [
        "src/**/*.spec.ts",
        "src/**/*.d.ts",
        "setup-jest.ts"
    ]
    }
```
Update package.json file
```
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```
```bash
npm install --save-dev ts-node --legacy-peer-deps
npm install --save-dev jest-environment-jsdom --legacy-peer-deps
npm install --save-dev jest-preset-angular@14.1.0 --legacy-peer-deps --force
npm test
```

## Features

- User authentication (login / register)
- View and manage bank accounts
- Transfer funds between accounts
- Transaction history with search filter
