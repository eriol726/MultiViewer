![Alt text](20190619_151103_4.gif?raw=true "Title")

# MultiViewer

Web application to manage and visualize the luggage handling at an airport. The user gives commands via a interface on a tablet and the affect will be shown in the other screen.


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.2.1.

## Instructions
1. Installing node modules by running `npm install`
2. Navigate to `./websocet-server` and run  `node main.js` to start the websocket server.
3. Find your your local ip adress by running `ipconfig` in your terminal and copy it. Replace `http://192.168.2.194` with the copied adress in `websocket.service.ts`.
4. Run `ng serve --host 0.0.0.0` to start a dev server. Open three new tabs in your browser and run this endpoints:
  - `http://localhost:4200/displayLeft`
  - `http://localhost:4200/displayMiddle`
  - `http://localhost:4200/displayRight`
  
5. In you tablet open a web browser and run `http://yourIPadress:4200` to open the GUI.

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
