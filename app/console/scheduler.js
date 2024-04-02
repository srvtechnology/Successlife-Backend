const schedule    = Helper('schedule');

schedule.run('node_srm test',schedule.exp.hourly(),'cron for every 1 hour','hourly');
schedule.run('node_srm test',schedule.exp.daily(),'cron for daily at 12 midnight','daily');
schedule.run('node_srm test',schedule.exp.firstDayOfMonth(),'cron run for first day of month','firstDayOfMonth');