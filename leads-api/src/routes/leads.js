const router = require('express').Router();

const Lead = require('../models/Lead');

router.post('/', async (req, res, next) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { status, source, limit = 100 } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (source) filters.source = source;

    const leads = await Lead.find(filters)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500));

    res.json(leads);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (_req, res, next) => {
  try {
    const [bySource, byStatus, totals] = await Promise.all([
      Lead.aggregate([
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 },
            avgScore: { $avg: '$score' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Lead.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgScore: { $avg: '$score' },
            hotCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'hot'] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    res.json({
      bySource,
      byStatus,
      totals: totals[0] || { total: 0, avgScore: 0, hotCount: 0 }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
