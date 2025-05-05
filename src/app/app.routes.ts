import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { LayoutComponent } from './components/layout/layout.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './components/home/home.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { SensorsComponent } from './components/sensors/sensors.component';
import { RoomComponent } from './components/room/room.component';
import { SensorComponent } from './components/sensor/sensor.component';
import { ScenariosComponent } from './components/scenarios/scenarios.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ScenarioComponent } from './components/scenario/scenario.component';
import { RemoteControlsComponent } from './components/remote-controls/remote-controls.component';
import { RemoteControlComponent } from './components/remote-control/remote-control.component';
import { SensorDataComponent } from './components/sensor-data/sensor-data.component';

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "signup",
        component: SignupComponent
    },
    {
        path: "",
        component: LayoutComponent,
        canActivateChild:[() => inject(AuthService).isAuthenticated()],
        children:[
            {
                path: "",
                component: HomeComponent
            },
            {
                path: "rooms",
                component: RoomsComponent
            },
            {
                path: "room/:id",
                component: RoomComponent
            },
            {
                path: "devices",
                component: SensorsComponent
            },
            {
                path: "device/:id",
                component: SensorComponent
            },
            {
                path: "sensor-data/:id",
                component: SensorDataComponent
            },
            {
                path: "scenarios",
                component: ScenariosComponent
            },
            // {
            //     path: "scenario/:id",
            //     component: ScenarioComponent
            // },
            {
                path: "remote-controls",
                component: RemoteControlsComponent
            },
            {
                path: "remote-control/:id",
                component: RemoteControlComponent
            },
            {
                path: "settings",
                component: SettingsComponent
            }
        ]
    }
];
