import React from 'react';
import './App.css';
import MarketScreen from './MarketScreen';
import Modal from './Modal';



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowIndex: 0,
      marketPaused: false,
      showModal: false
    };

    this.WATERCOOLER = false;
    
    this.timestamps = ["9/18 13:40", "9/18 13:41", "9/18 13:42", "9/18 13:43", "9/18 13:44", "9/18 13:45", "9/18 13:46", "9/18 13:47", "9/18 13:48", "9/18 13:49", "9/18 13:50", "9/18 13:51", "9/18 13:52", "9/18 13:53", "9/18 13:54", "9/18 13:55", "9/18 13:56", "9/18 13:57", "9/18 13:58", "9/18 13:59", "9/18 14:00", "9/18 14:01", "9/18 14:02", "9/18 14:03", "9/18 14:04", "9/18 14:05", "9/18 14:06", "9/18 14:07", "9/18 14:08", "9/18 14:09", "9/18 14:10", "9/18 14:11", "9/18 14:12", "9/18 14:13", "9/18 14:14", "9/18 14:15", "9/18 14:16", "9/18 14:17", "9/18 14:18", "9/18 14:19", "9/18 14:20", "9/18 14:21", "9/18 14:22", "9/18 14:23", "9/18 14:24", "9/18 14:25", "9/18 14:26", "9/18 14:27", "9/18 14:28", "9/18 14:29", "9/18 14:30", "9/18 14:31", "9/18 14:32", "9/18 14:33", "9/18 14:34", "9/18 14:35", "9/18 14:36", "9/18 14:37", "9/18 14:38", "9/18 14:39", "9/18 14:40", "9/18 14:41", "9/18 14:42", "9/18 14:43", "9/18 14:44", "9/18 14:45", "9/18 14:46", "9/18 14:47", "9/18 14:48", "9/18 14:49", "9/18 14:50", "9/18 14:51", "9/18 14:52", "9/18 14:53", "9/18 14:54", "9/18 14:55", "9/18 14:56", "9/18 14:57", "9/18 14:58", "9/18 14:59", "9/18 15:00", "9/18 15:01", "9/18 15:02", "9/18 15:03", "9/18 15:04", "9/18 15:05", "9/18 15:06", "9/18 15:07", "9/18 15:08", "9/18 15:09", "9/18 15:10", "9/18 15:11", "9/18 15:12", "9/18 15:13", "9/18 15:14", "9/18 15:15", "9/18 15:16", "9/18 15:17", "9/18 15:18", "9/18 15:19", "9/18 15:20", "9/18 15:21", "9/18 15:22", "9/18 15:23", "9/18 15:24", "9/18 15:25", "9/18 15:26", "9/18 15:27", "9/18 15:28", "9/18 15:29", "9/18 15:30", "9/18 15:31", "9/18 15:32", "9/18 15:33", "9/18 15:34", "9/18 15:35", "9/18 15:36", "9/18 15:37", "9/18 15:38", "9/18 15:39", "9/18 15:40", "9/18 15:41", "9/18 15:42", "9/18 15:43", "9/18 15:44", "9/18 15:45", "9/18 15:46", "9/18 15:47", "9/18 15:48", "9/18 15:49", "9/18 15:50", "9/18 15:51", "9/18 15:52", "9/18 15:53", "9/18 15:54", "9/18 15:55", "9/18 15:56", "9/18 15:57", "9/18 15:58", "9/18 15:59", "9/19 9:30", "9/19 9:31", "9/19 9:32", "9/19 9:33", "9/19 9:34", "9/19 9:35", "9/19 9:36", "9/19 9:37", "9/19 9:38", "9/19 9:39", "9/19 9:40", "9/19 9:41", "9/19 9:42", "9/19 9:43", "9/19 9:44", "9/19 9:45", "9/19 9:46", "9/19 9:47", "9/19 9:48", "9/19 9:49", "9/19 9:50", "9/19 9:51", "9/19 9:52", "9/19 9:53", "9/19 9:54", "9/19 9:55", "9/19 9:56", "9/19 9:57", "9/19 9:58", "9/19 9:59", "9/19 10:00", "9/19 10:01", "9/19 10:02", "9/19 10:03", "9/19 10:04", "9/19 10:05", "9/19 10:06", "9/19 10:07", "9/19 10:08", "9/19 10:09", "9/19 10:10", "9/19 10:11", "9/19 10:12", "9/19 10:13", "9/19 10:14", "9/19 10:15", "9/19 10:16", "9/19 10:17", "9/19 10:18", "9/19 10:19", "9/19 10:20", "9/19 10:21", "9/19 10:22", "9/19 10:23", "9/19 10:24", "9/19 10:25", "9/19 10:26", "9/19 10:27", "9/19 10:28", "9/19 10:29", "9/19 10:30", "9/19 10:31", "9/19 10:32", "9/19 10:33", "9/19 10:34", "9/19 10:35", "9/19 10:36", "9/19 10:37", "9/19 10:38", "9/19 10:39", "9/19 10:40", "9/19 10:41", "9/19 10:42", "9/19 10:43", "9/19 10:44", "9/19 10:45", "9/19 10:46", "9/19 10:47", "9/19 10:48", "9/19 10:49", "9/19 10:50", "9/19 10:51", "9/19 10:52", "9/19 10:53", "9/19 10:54", "9/19 10:55", "9/19 10:56", "9/19 10:57", "9/19 10:58", "9/19 10:59", "9/19 11:00", "9/19 11:01", "9/19 11:02", "9/19 11:03", "9/19 11:04", "9/19 11:05", "9/19 11:06", "9/19 11:07", "9/19 11:08", "9/19 11:09", "9/19 11:10", "9/19 11:11", "9/19 11:12", "9/19 11:13", "9/19 11:14", "9/19 11:15", "9/19 11:16", "9/19 11:17", "9/19 11:18", "9/19 11:19", "9/19 11:20", "9/19 11:21", "9/19 11:22", "9/19 11:23", "9/19 11:24", "9/19 11:25", "9/19 11:26", "9/19 11:27", "9/19 11:28", "9/19 11:29", "9/19 11:30", "9/19 11:31", "9/19 11:32", "9/19 11:33", "9/19 11:34", "9/19 11:35", "9/19 11:36", "9/19 11:37", "9/19 11:38", "9/19 11:39", "9/19 11:40", "9/19 11:41", "9/19 11:42", "9/19 11:43", "9/19 11:44", "9/19 11:45", "9/19 11:46", "9/19 11:47", "9/19 11:48", "9/19 11:49", "9/19 11:50", "9/19 11:51", "9/19 11:52", "9/19 11:53", "9/19 11:54", "9/19 11:55", "9/19 11:56", "9/19 11:57", "9/19 11:58", "9/19 11:59", "9/19 12:00", "9/19 12:01", "9/19 12:02", "9/19 12:03", "9/19 12:04", "9/19 12:05", "9/19 12:06", "9/19 12:07", "9/19 12:08", "9/19 12:09", "9/19 12:10", "9/19 12:11", "9/19 12:12", "9/19 12:13", "9/19 12:14", "9/19 12:15", "9/19 12:16", "9/19 12:17", "9/19 12:18", "9/19 12:19", "9/19 12:20", "9/19 12:21", "9/19 12:22", "9/19 12:23", "9/19 12:24", "9/19 12:25", "9/19 12:26", "9/19 12:27", "9/19 12:28", "9/19 12:29", "9/19 12:30", "9/19 12:31", "9/19 12:32", "9/19 12:33", "9/19 12:34", "9/19 12:35", "9/19 12:36", "9/19 12:37", "9/19 12:38", "9/19 12:39", "9/19 12:40", "9/19 12:41", "9/19 12:42", "9/19 12:43", "9/19 12:44", "9/19 12:45", "9/19 12:46", "9/19 12:47", "9/19 12:48", "9/19 12:49", "9/19 12:50", "9/19 12:51", "9/19 12:52", "9/19 12:53", "9/19 12:54", "9/19 12:55", "9/19 12:56", "9/19 12:57", "9/19 12:58", "9/19 12:59", "9/19 13:00", "9/19 13:01", "9/19 13:02", "9/19 13:03", "9/19 13:04", "9/19 13:05", "9/19 13:06", "9/19 13:07", "9/19 13:08", "9/19 13:09", "9/19 13:10", "9/19 13:11", "9/19 13:12", "9/19 13:13", "9/19 13:14", "9/19 13:15", "9/19 13:16", "9/19 13:17", "9/19 13:18", "9/19 13:19", "9/19 13:20", "9/19 13:21", "9/19 13:22", "9/19 13:23", "9/19 13:24", "9/19 13:25", "9/19 13:26", "9/19 13:27", "9/19 13:28", "9/19 13:29", "9/19 13:30", "9/19 13:31", "9/19 13:32", "9/19 13:33", "9/19 13:34", "9/19 13:35", "9/19 13:36", "9/19 13:37", "9/19 13:38", "9/19 13:39", "9/19 13:40", "9/19 13:41", "9/19 13:42", "9/19 13:43", "9/19 13:44", "9/19 13:45", "9/19 13:46", "9/19 13:47", "9/19 13:48", "9/19 13:49", "9/19 13:50", "9/19 13:51", "9/19 13:52", "9/19 13:53", "9/19 13:54", "9/19 13:55", "9/19 13:56", "9/19 13:57", "9/19 13:58", "9/19 13:59", "9/19 14:00", "9/19 14:01", "9/19 14:02", "9/19 14:03", "9/19 14:04", "9/19 14:05", "9/19 14:06", "9/19 14:07", "9/19 14:08", "9/19 14:09", "9/19 14:10", "9/19 14:11", "9/19 14:12", "9/19 14:13", "9/19 14:14", "9/19 14:15", "9/19 14:16", "9/19 14:17", "9/19 14:18", "9/19 14:19", "9/19 14:20", "9/19 14:21", "9/19 14:22", "9/19 14:23", "9/19 14:24", "9/19 14:25", "9/19 14:26", "9/19 14:27", "9/19 14:28", "9/19 14:29", "9/19 14:30", "9/19 14:31", "9/19 14:32", "9/19 14:33", "9/19 14:34", "9/19 14:35", "9/19 14:36", "9/19 14:37", "9/19 14:38", "9/19 14:39", "9/19 14:40", "9/19 14:41", "9/19 14:42", "9/19 14:43", "9/19 14:44", "9/19 14:45", "9/19 14:46", "9/19 14:47", "9/19 14:48", "9/19 14:49", "9/19 14:50", "9/19 14:51", "9/19 14:52", "9/19 14:53", "9/19 14:54", "9/19 14:55", "9/19 14:56", "9/19 14:57", "9/19 14:58", "9/19 14:59", "9/19 15:00", "9/19 15:01", "9/19 15:02", "9/19 15:03", "9/19 15:04", "9/19 15:05", "9/19 15:06", "9/19 15:07", "9/19 15:08", "9/19 15:09", "9/19 15:10", "9/19 15:11", "9/19 15:12", "9/19 15:13", "9/19 15:14", "9/19 15:15", "9/19 15:16", "9/19 15:17", "9/19 15:18", "9/19 15:19", "9/19 15:20", "9/19 15:21", "9/19 15:22", "9/19 15:23", "9/19 15:24", "9/19 15:25", "9/19 15:26", "9/19 15:27", "9/19 15:28", "9/19 15:29", "9/19 15:30", "9/19 15:31", "9/19 15:32", "9/19 15:33", "9/19 15:34", "9/19 15:35", "9/19 15:36", "9/19 15:37", "9/19 15:38", "9/19 15:39", "9/19 15:40", "9/19 15:41", "9/19 15:42", "9/19 15:43", "9/19 15:44", "9/19 15:45", "9/19 15:46", "9/19 15:47", "9/19 15:48", "9/19 15:49", "9/19 15:50", "9/19 15:51", "9/19 15:52", "9/19 15:53", "9/19 15:54", "9/19 15:55", "9/19 15:56", "9/19 15:57", "9/19 15:58", "9/19 15:59", "9/20 9:30", "9/20 9:31", "9/20 9:32", "9/20 9:33", "9/20 9:34", "9/20 9:35", "9/20 9:36", "9/20 9:37", "9/20 9:38", "9/20 9:39", "9/20 9:40", "9/20 9:41", "9/20 9:42", "9/20 9:43", "9/20 9:44", "9/20 9:45", "9/20 9:46", "9/20 9:47", "9/20 9:48", "9/20 9:49", "9/20 9:50", "9/20 9:51", "9/20 9:52", "9/20 9:53", "9/20 9:54", "9/20 9:55", "9/20 9:56", "9/20 9:57", "9/20 9:58", "9/20 9:59", "9/20 10:00", "9/20 10:01", "9/20 10:02", "9/20 10:03", "9/20 10:04", "9/20 10:05", "9/20 10:06", "9/20 10:07", "9/20 10:08", "9/20 10:09", "9/20 10:10", "9/20 10:11", "9/20 10:12", "9/20 10:13", "9/20 10:14", "9/20 10:15", "9/20 10:16", "9/20 10:17", "9/20 10:18", "9/20 10:19", "9/20 10:20", "9/20 10:21", "9/20 10:22", "9/20 10:23", "9/20 10:24", "9/20 10:25", "9/20 10:26", "9/20 10:27", "9/20 10:28", "9/20 10:29", "9/20 10:30", "9/20 10:31", "9/20 10:32", "9/20 10:33", "9/20 10:34", "9/20 10:35", "9/20 10:36", "9/20 10:37", "9/20 10:38", "9/20 10:39", "9/20 10:40", "9/20 10:41", "9/20 10:42", "9/20 10:43", "9/20 10:44", "9/20 10:45", "9/20 10:46", "9/20 10:47", "9/20 10:48", "9/20 10:49", "9/20 10:50", "9/20 10:51", "9/20 10:52", "9/20 10:53", "9/20 10:54", "9/20 10:55", "9/20 10:56", "9/20 10:57", "9/20 10:58", "9/20 10:59", "9/20 11:00", "9/20 11:01", "9/20 11:02", "9/20 11:03", "9/20 11:04", "9/20 11:05", "9/20 11:06", "9/20 11:07", "9/20 11:08", "9/20 11:09", "9/20 11:10", "9/20 11:11", "9/20 11:12", "9/20 11:13", "9/20 11:14", "9/20 11:15", "9/20 11:16", "9/20 11:17", "9/20 11:18", "9/20 11:19", "9/20 11:20", "9/20 11:21", "9/20 11:22", "9/20 11:23", "9/20 11:24", "9/20 11:25", "9/20 11:26", "9/20 11:27", "9/20 11:28", "9/20 11:29"];
    this.prices = [217.7568462, 217.5768462, 217.3368462, 217.4568462, 217.5168462, 217.4568462, 217.3368462, 217.0368462, 217.3368462, 217.3968462, 217.6368462, 217.5768462, 217.6368462, 217.9368462, 218.8368462, 218.4168462, 218.1168462, 217.8168462, 217.4568462, 217.3368462, 221.3568462, 220.8168462, 215.1168462, 217.2768462, 217.4508462, 219.1368462, 220.0968462, 221.3568462, 220.3968462, 218.5908462, 217.2708462, 216.3768462, 217.0968462, 216.4308462, 214.6968462, 212.4168462, 212.5968462, 214.3368462, 214.2168462, 213.3168462, 211.2168462, 210.0768462, 211.6368462, 211.2108462, 210.9168462, 211.3368462, 211.3968462, 211.3368462, 211.2768462, 210.6168462, 210.4368462, 212.7768462, 212.3568462, 212.3568462, 213.6708462, 213.6168462, 212.0568462, 212.1768462, 212.0568462, 212.1768462, 213.7368462, 214.2108462, 215.5908462, 215.7768462, 214.9308462, 214.5108462, 213.1368462, 211.2768462, 210.3108462, 211.6968462, 212.4168462, 214.0308462, 214.8768462, 215.8908462, 216.0768462, 216.0768462, 214.8168462, 214.9368462, 215.8908462, 215.8968462, 217.2768462, 217.0368462, 216.6108462, 216.0708462, 216.7908462, 216.7968462, 217.0368462, 218.5368462, 220.7568462, 220.3368462, 220.6968462, 220.9968462, 221.7768462, 220.8768462, 220.6308462, 220.7568462, 220.5708462, 221.1768462, 221.3568462, 223.3368462, 223.6368462, 223.8708462, 222.6168462, 222.2568462, 222.6768462, 222.9768462, 223.9908462, 223.7568462, 223.8768462, 223.5768462, 223.9968462, 223.5768462, 224.7168462, 225.7968462, 226.6968462, 227.6568462, 227.1168462, 224.2308462, 225.1308462, 225.4968462, 225.6768462, 226.8768462, 225.9168462, 225.4908462, 225.6768462, 225.9168462, 224.9568462, 224.6568462, 224.6568462, 225.4968462, 225.6708462, 224.8908462, 224.7768462, 224.9568462, 225.0168462, 225.6708462, 226.1568462, 227.2368462, 227.2968462, 227.8968462, 225.6168462, 226.7568462, 228.9768462, 227.6568462, 225.5568462, 225.3168462, 228.8568462, 228.0768462, 228.4308462, 228.4968462, 227.2968462, 226.0968462, 225.4968462, 226.5168462, 228.4968462, 228.0168462, 226.8768462, 226.3968462, 226.8768462, 227.5368462, 228.3168462, 227.5968462, 227.1768462, 226.2168462, 227.2368462, 227.7168462, 228.4368462, 228.3168462, 229.1568462, 230.2368462, 228.7968462, 229.3368462, 228.6168462, 228.6168462, 227.5968462, 228.4308462, 228.7308462, 228.7368462, 229.0968462, 228.8568462, 229.0368462, 228.4968462, 228.6168462, 228.4968462, 228.5568462, 229.3368462, 229.3968462, 229.4508462, 229.6368462, 228.7968462, 228.8568462, 228.9108462, 229.5108462, 229.2708462, 229.7568462, 229.5168462, 229.4568462, 229.8108462, 229.3368462, 229.3968462, 229.6968462, 229.7568462, 230.5968462, 229.9908462, 229.9968462, 229.9908462, 230.8968462, 230.8968462, 231.0168462, 230.8368462, 231.5568462, 231.4968462, 231.3768462, 231.4368462, 231.4368462, 231.3768462, 231.4368462, 232.9368462, 232.8768462, 232.6308462, 232.5168462, 232.8768462, 232.8168462, 232.8768462, 232.9368462, 232.9368462, 233.4768462, 232.6968462, 231.6168462, 230.9568462, 230.8308462, 231.2568462, 230.8368462, 230.5968462, 230.1168462, 229.8768462, 229.4568462, 229.1568462, 228.6108462, 228.4368462, 229.0368462, 228.9168462, 228.8568462, 228.0768462, 227.1168462, 226.9968462, 226.7568462, 226.9968462, 227.0568462, 227.7168462, 227.9568462, 227.7168462, 227.2968462, 227.1168462, 226.6308462, 226.6368462, 226.9308462, 226.6368462, 226.7568462, 226.1568462, 226.8168462, 227.3568462, 227.2968462, 227.1168462, 228.0168462, 227.9568462, 228.2568462, 228.6168462, 228.8568462, 228.9768462, 228.4368462, 228.0168462, 227.6568462, 226.5168462, 225.4968462, 224.8368462, 224.6568462, 224.3568462, 223.9368462, 223.8768462, 223.6368462, 223.1568462, 223.5168462, 223.8168462, 223.8168462, 223.6368462, 223.9968462, 224.3568462, 224.2968462, 223.9968462, 224.0568462, 224.6568462, 224.2968462, 223.9368462, 223.5168462, 223.6368462, 223.2768462, 223.2168462, 223.2168462, 223.0968462, 222.9168462, 221.9568462, 222.3768462, 222.3168462, 222.6168462, 222.5568462, 222.4368462, 222.0168462, 221.7108462, 221.2908462, 221.0568462, 221.4168462, 221.7768462, 221.6568462, 221.5368462, 221.5968462, 221.3568462, 220.6968462, 219.6768462, 218.1768462, 217.2768462, 217.5168462, 217.5768462, 217.8768462, 217.8768462, 217.2768462, 217.0368462, 217.9968462, 218.5968462, 218.8968462, 219.6515202, 219.2915202, 219.6515202, 219.8915202, 219.4115202, 218.5715202, 218.6795202, 219.7715202, 220.3715202, 220.4915202, 219.6515202, 219.0515202, 219.2915202, 218.0915202, 218.9315202, 219.4115202, 220.4915202, 220.1315202, 220.2515202, 220.3715202, 221.3315202, 221.3195202, 221.0915202, 221.4515202, 222.6515202, 223.4795202, 222.6515202, 220.3715202, 219.5315202, 219.0515202, 217.6115202, 217.8395202, 217.4915202, 217.0115202, 217.6115202, 219.0515202, 218.9315202, 219.4115202, 218.6915202, 219.6515202, 219.2915202, 218.9315202, 219.4115202, 220.1315202, 220.9715202, 220.7315202, 219.8915202, 220.8515202, 220.2515202, 219.5315202, 218.4515202, 212.0915202, 213.6515202, 214.8515202, 215.6915202, 215.2115202, 216.7715202, 216.1715202, 216.2915202, 215.9315202, 216.1715202, 213.6515202, 214.3715202, 213.2915202, 214.0115202, 215.5715202, 215.2115202, 214.6115202, 214.6115202, 215.9315202, 216.2915202, 217.7315202, 217.7315202, 218.5715202, 220.2395202, 219.5315202, 219.2915202, 220.3715202, 222.4115202, 222.2915202, 222.1595202, 223.4915202, 223.3715202, 223.6115202, 223.3715202, 222.8915202, 222.1715202, 222.9995202, 223.3715202, 223.6115202, 223.3715202, 223.8515202, 223.3715202, 222.4115202, 221.3315202, 220.8515202, 220.1315202, 220.1315202, 221.0915202, 220.8515202, 221.6915202, 221.5715202, 221.0795202, 219.5315202, 219.0395202, 219.5315202, 219.5315202, 219.8915202, 219.0515202, 219.2915202, 219.1715202, 218.8115202, 218.0795202, 217.2515202, 218.5715202, 219.0515202, 217.1315202, 217.1315202, 217.3715202, 216.2915202, 215.5715202, 215.8115202, 215.8115202, 216.1715202, 216.2795202, 215.8115202, 215.1995202, 214.7315202, 213.4115202, 213.2915202, 214.3595202, 215.3315202, 215.2115202, 215.9315202, 216.1715202, 216.0515202, 216.8915202, 216.4115202, 215.9315202, 216.0515202, 216.1715202, 215.9315202, 216.5315202, 216.1715202, 215.9315202, 215.3315202, 216.1595202, 216.7715202, 217.2515202, 217.8515202, 221.4515202, 222.6515202, 219.7715202, 218.5715202, 219.0515202, 219.5315202, 220.2515202, 221.6915202, 221.2115202, 220.0115202, 222.6515202, 222.6515202, 221.4515202, 221.2115202, 220.7315202, 220.2275202, 220.0115202, 220.0115202, 220.7315202, 221.2115202, 220.7315202, 219.2915202, 216.6515202, 211.8515202, 211.5875202, 210.8915202, 209.6915202, 209.9315202, 212.8115202, 214.4915202, 215.2115202, 217.9368462, 217.7568462, 217.6368462, 217.6968462, 217.8168462, 217.8768462, 217.5768462, 218.0568462, 217.6968462, 217.6368462, 216.9768462, 217.0968462, 217.1568462, 216.9168462, 217.5168462, 217.4568462, 217.4568462, 217.0368462, 217.3968462, 224.7168462, 226.0968462, 225.3708462, 224.3568462, 225.0708462, 223.8708462, 223.7568462, 223.5768462, 224.1768462, 225.0768462, 224.5368462, 224.2368462, 223.8768462, 223.2768462, 222.9168462, 223.0368462, 222.3768462, 222.0168462, 222.5568462, 222.6768462, 221.2968462, 222.3168462, 222.3168462, 222.3708462, 222.1308462, 221.8368462, 222.3768462, 222.3168462, 222.6768462, 222.4968462, 223.2168462, 223.2768462, 222.2568462, 222.1968462, 222.3768462, 222.3768462, 221.5968462, 222.5568462, 223.0968462, 222.2568462, 222.2508462, 222.6768462, 221.8908462, 221.3568462, 221.3568462, 221.4768462, 222.1968462, 222.4368462, 223.0968462, 222.9168462, 222.8568462, 222.6768462, 222.6768462, 222.7968462, 222.6768462, 222.3768462, 221.9568462, 221.9568462, 221.9568462, 221.8368462, 223.3368462, 223.5168462, 224.2968462, 224.5968462, 224.5968462, 224.2968462, 225.4308462, 225.3768462, 225.4968462, 224.7108462, 223.2168462, 223.2108462, 223.6368462, 223.9308462, 223.7568462, 223.6368462, 224.2368462, 224.2968462, 224.5968462, 224.1768462, 223.9968462, 224.3508462, 224.4168462, 224.1108462, 223.5168462, 223.1568462, 223.2168462, 222.4968462, 222.4368462, 222.8568462, 222.5568462, 223.5168462, 223.3968462, 223.2168462, 223.2168462, 222.7968462, 222.7368462, 223.2168462, 223.0968462, 223.0368462, 223.2768462, 223.5768462, 223.5768462, 223.3368462, 222.2568462, 222.1368462, 222.3768462, 222.3168462, 222.0168462, 222.4368462, 222.7308462, 223.1568462, 222.9708462, 222.7368462, 223.4568462, 223.2168462, 222.7368462, 222.4368462, 221.02, 220.8968462];
    this.pauseIndices = [331, 502];
    this.modalChild = null;
    
    this.incrementIndex = this.incrementIndex.bind(this);
    this.handleTimedEvents = this.handleTimedEvents.bind(this);
    this.unpauseTrading = this.unpauseTrading.bind(this);
    this.setModal = this.setModal.bind(this);

    this.one = this.one.bind(this);
    this.five = this.five.bind(this);
    this.ten = this.ten.bind(this);
  }

  componentDidMount() { 
    this.timerID = setInterval(
      () => this.incrementIndex(),
      1000
    );
  }

  incrementIndex() {
    // increment index only when trading is inactive    
    if (!this.state.marketPaused) {
      this.setState(
        state => ({nowIndex: state.nowIndex + 1})
      );
    }
    this.handleTimedEvents();
  }

  handleTimedEvents() { 
    if (this.pauseIndices.includes(this.state.nowIndex)) {
      this.setState({marketPaused: true})
    }
    
    if (this.WATERCOOLER && this.state.nowIndex > this.pauseIndices[0] && this.state.nowIndex < this.pauseIndices[1]) {
      this.setModal(true);
      this.modalChild = FillerOrScreen();
    }

    if (this.WATERCOOLER && this.state.nowIndex >= this.pauseIndices[1]) {
      this.setModal(false);
      this.modalChild = null;
    }

    //conclude experiment
    if (this.state.nowIndex === this.timestamps.length) {
      console.log('hit2');
      this.setModal(true);
      this.modalChild = Conclude();
      clearInterval(this.timerID);
      this.setState({nowIndex: this.timestamps.length-1});
    }
  }

  unpauseTrading() {
    this.setState({marketPaused: false})
  }

  setModal(flag) {
    this.setState({showModal: flag});
  }

  one() {
    clearInterval(this.timerID);
    this.timerID = setInterval(
      () => this.incrementIndex(),
      1000
    );
  }
  
  five() {
    clearInterval(this.timerID);
    this.timerID = setInterval(
      () => this.incrementIndex(),
      200
    );
  }

  ten() {
    clearInterval(this.timerID);
    this.timerID = setInterval(
      () => this.incrementIndex(),
      100
    );
  }

  render() {  
    var price = Math.round((this.prices[this.state.nowIndex] + Number.EPSILON) * 100) / 100;
    var timestamp = this.timestamps[this.state.nowIndex]

    return (
      <div className="App">
        <div className="App-container" >
          <Modal show={this.state.showModal} onClose={()=>this.setModal(false)} children={this.modalChild}/>
          <MarketScreen price={price} timestamp={timestamp} pausedForTrade={this.state.marketPaused} resume={this.unpauseTrading}/>
          <ExperimentSpeed one={this.one} five={this.five} ten={this.ten}/>
        </div>
      </div>
    );
  }
}


function FillerOrScreen() {
  return (
    <div>
      <h1>WATERCOOLER MOMENT</h1>
      <h2>How should we interact with the user on this screen?</h2>
    </div>
  );
}


function Conclude() {
  return (
    <div>
      <h1>Experiment complete</h1>
    </div>
  );
}

class ExperimentSpeed extends React.Component {
  render() {
    return (
     <div style={{marginTop:"20px"}}>
       <button className="btn" onClick={this.props.one}>1x</button>
       <button className="btn" onClick={this.props.five}>5x</button>
       <button className="btn" onClick={this.props.ten}>10x</button> 
     </div>
   );
 }
}


















export default App;
