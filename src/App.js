import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import routes from './route';


class App extends React.Component {
	render() {
		return (
			<Router>
					<div className="app">
						{/* Noi Dung */}
						<Switch>
							{this.showContent(routes)}
						</Switch>
					</div>
				</Router>
		)
	}
	showContent = (routes) => {
		let result = null;
		if (routes.length > 0) {
			result = routes.map((route, index) => {
				return (
					<Route
						key={index}
						path={route.path}
						exact={route.exact}
						component={route.main}
					/>
				);
			});
		}
		return result;
	}
}

export default App;
