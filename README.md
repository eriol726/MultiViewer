![Alt text](20190619_151103_4.gif?raw=true "Title")



# MultiViewer

Web application created as a prototype to demonstrate the design of an automated warehouse control room concept that comprises three screens and a tablet. The concept is a result of an ongoing collaboration between Linköping University and Toyota Material Handling in Mjölby, Sweden and it focuses on human-automation collaboration. 

The prototype demonstrates a future scenario of baggage handling in an airport where human operators in the control room plan and oversees the system operations with the support of an AI that draws on real-time and historical data to analyze the status of the various system components and predict maintenance needs. It enables the user to play the role of a human operator that tries to manage an emergent situation in this future scenario. The application drives the screens and the tablet and enables the user interaction with them. The user can view predictions and actions suggested by the AI and manipulate the relevant content on each screen via tablet using touch gestures.

The central screen — Incidents/Predictions — displays a graph with two lines: the blue one represents the predicted available capacity and the orange one represents the predicted required capacity. The right screen — Countermeasures — displays possible actions that AI suggests regarding the incident in focus on the central screen. The left screen — Action Plan — displays the action taken that refers to the incident in focus. The tablet’s screen is divided into three frames and each frame corresponds to the respective screens.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.2.1.

## Instructions
1. Install node modules by running `npm install`.
2. Install font by navigate to `MultiViewer/src/assets/Titillium` open `Titillium-Regular.otf` and install it.
3. Find your your local ip adress by running `ipconfig` in your terminal and copy it. Replace `http://192.168.2.194` with the copied adress in `MultiViewer/src/app/websocket.service.ts`.
4. Navigate to `MultiViewer/src/app/websocket.service.ts` and run  `node main` to start the websocket server.

5. Run `ng serve --host 0.0.0.0` to start a dev server. Open three new tabs in your browser and run this routes:
  - `http://localhost:4200/displayLeft`
  - `http://localhost:4200/displayMiddle`
  - `http://localhost:4200/displayRight`
  
6. In you tablet open a web browser and run `http://yourIPadress:4200` to open the GUI.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
