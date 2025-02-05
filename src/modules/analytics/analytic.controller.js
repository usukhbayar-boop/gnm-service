const axios = require('axios');
const moment = require("moment");
const { pool } = require('../../config/db');

exports.hitsByDays = async (req, res) => {
    let data;
    const end = moment(req.query.end).endOf("day").toDate();
    const start = moment(req.query.start).startOf("day").toDate();
    if (moment(start).add("91", "days").isAfter(end)) {
        const year = moment().format("YYYY");

        try {
        const result = await pool.query(`select AA.* from (
            select
              count(id),
              created_day as day
            from analytics_pageviews
            where
              created_at >= $1 and created_at <= $2
            group by created_day
          ) AA order by AA.day asc`, [start, end]);
        data = ((result || {}).rows || []).map((day) => ({
            ...day,
            day: day?.day?.replace(year, "")
        }));
        res.status(200).json({
            message: 'success',
            data
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
}

exports.hitsByMonth = async (req, res) => {
  try {
    const result = await pool.query(`select AA.* from (
    select
      count(id),
      created_month as month
    from analytics_pageviews
      group by created_month
    ) AA order by AA.month asc`);
    res.status(200).json({
        message: 'success',
        data: (result || {}).rows || [] 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

