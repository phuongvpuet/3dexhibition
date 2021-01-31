import React from 'react';
import Scene3D from './lib/Scene3D';
import Scene from './view/construction/Scene';
import ViewCons from './view/construction/ViewCons';
import Home from './view/home/Home';
import Preview from './view/preview/Preview';
import Showroom from './view/showroom/Showroom';

const routes = [
    {
        path: '/',
        exact: true,
        main: () => <Home />
    },
    {
        path: '/construction',
        exact: false,
        main: () => <ViewCons />
    },
    // {
    //     path: '/view',
    //     exact: false,
    //     main: () => <Preview />
    // },
    {
        path: '/showroom',
        exact: false,
        main: () => <Showroom />
    }
];

export default routes;

