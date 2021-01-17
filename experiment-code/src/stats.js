var stats = {
	max: function(array) {
		return Math.max.apply(null, array);
	},

	min: function(array) {
		return Math.min.apply(null, array);
	},

	range: function(array) {
		return stats.max(array) - stats.min(array);
	},

	midrange: function(array) {
		return stats.range(array) / 2;
	},

	sum: function(array) {
		var num = 0;
		for (var i = 0, l = array.length; i < l; i++) num += array[i];
		return num;
	},

	mean: function(array) {
		return stats.sum(array) / array.length;
	},

	median: function(array) {
		array.sort(function(a, b) {
			return a - b;
		});
		var mid = array.length / 2;
		return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
	},

	modes: function(array) {
		if (!array.length) return [];
		var modeMap = {},
			maxCount = 0,
			modes = [];

		array.forEach(function(val) {
			if (!modeMap[val]) modeMap[val] = 1;
			else modeMap[val]++;

			if (modeMap[val] > maxCount) {
				modes = [val];
				maxCount = modeMap[val];
			}
			else if (modeMap[val] === maxCount) {
				modes.push(val);
				maxCount = modeMap[val];
			}
		});
		return modes;
	},

	variance: function(array) {
		var mean = stats.mean(array);
		return stats.mean(array.map(function(num) {
			return Math.pow(num - mean, 2);
		}));
	},

	standardDeviation: function(array) {
		return Math.sqrt(stats.variance(array));
	},

	meanAbsoluteDeviation: function(array) {
		var mean = stats.mean(array);
		return stats.mean(array.map(function(num) {
			return Math.abs(num - mean);
		}));
	},

	zScores: function(array) {
		var mean = stats.mean(array);
		var standardDeviation = stats.standardDeviation(array);
		return array.map(function(num) {
			return (num - mean) / standardDeviation;
		});
	},

	precisionRound: function(float, precision) {
		var power = Math.pow(10, precision)
		return Math.round((float + Number.EPSILON) * power) / power;
	},
};

export { stats }
