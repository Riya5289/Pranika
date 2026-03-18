const Resource = require('../models/Resource');
const Hospital = require('../models/Hospital');
const { calculateDistance } = require('../utils/distance');

exports.getResources = async (req, res) => {
  try {
    const { filter, lat, lng } = req.query;
    let resources = await Resource.find().populate('hospitalId', 'name address location hospitalType specialties contact');

    // If user location provided, compute distance to each hospital and attach it
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      resources = resources.map(r => {
        const hosp = r.hospitalId;
        if (hosp && hosp.location && typeof hosp.location.lat === 'number' && typeof hosp.location.lng === 'number') {
          const dist = calculateDistance(userLat, userLng, hosp.location.lat, hosp.location.lng);
          // Attach distance in kilometers (rounded to one decimal)
          r = r.toObject ? r.toObject() : JSON.parse(JSON.stringify(r));
          r.hospitalId = { ...r.hospitalId, distance: Math.round(dist * 10) / 10 };
        }
        return r;
      });
      // Sort by distance when available
      resources.sort((a, b) => {
        const da = a.hospitalId?.distance ?? Number.POSITIVE_INFINITY;
        const db = b.hospitalId?.distance ?? Number.POSITIVE_INFINITY;
        return da - db;
      });
    }

    if (filter === 'icu') resources = resources.filter(r => r.icuBeds.available > 0);
    if (filter === 'general') resources = resources.filter(r => r.generalBeds.available > 0);
    if (filter === 'ventilator') resources = resources.filter(r => r.ventilators.available > 0);
    if (filter === 'oxygen') resources = resources.filter(r => r.oxygen === 'Available');

    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedResources = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    await Resource.deleteMany({});
    const resources = hospitals.map(h => ({
      hospitalId: h._id,
      icuBeds: { total: Math.floor(Math.random() * 30) + 10, available: Math.floor(Math.random() * 15) },
      generalBeds: { total: Math.floor(Math.random() * 100) + 50, available: Math.floor(Math.random() * 50) },
      ventilators: { total: Math.floor(Math.random() * 20) + 5, available: Math.floor(Math.random() * 10) },
      oxygen: ['Available', 'Limited', 'Available', 'Available'][Math.floor(Math.random() * 4)]
    }));
    await Resource.insertMany(resources);
    res.json({ success: true, message: `${resources.length} resource records seeded` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
