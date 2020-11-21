import React from 'react';
import ViewCons from './view/construction/ViewCons';
import Home from './view/home/Home';
import Preview from './view/preview/Preview';

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
    {
        path: '/view',
        exact: false,
        main: () => <Preview />
    }
];

export default routes;

