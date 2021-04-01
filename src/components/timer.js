import moment from 'moment';
import React from 'react';
import './timer.css';

export default class Countdown extends React.Component {
	state = {
		days: undefined,
		hours: undefined,
		minutes: undefined,
		seconds: undefined
	}

	componentDidMount() {
		this.interval = setInterval(() => {
			const then = this.props.then;
			const now = Date.now();
			const countdown = moment(then - now);
			const days = countdown.format('D');
			const hours = countdown.format('HH');
			const minutes = countdown.format('mm');
			const seconds = countdown.format('ss');

			this.setState({ days, hours, minutes, seconds });
		}, 1000);
	}

	componentWillUnmount() {
		if(this.interval) {
			clearInterval(this.interval);
		}
	}

	render() {
		const { days, hours, minutes, seconds } = this.state;

        if(!seconds) {
			return null;
		}

		return (
			<div>
				<div className='countdown-wrapper'>
                    <div className='countdown-item'>
                        {minutes}:{seconds}
                    </div>
                </div>
			</div>
		);
	}
}
