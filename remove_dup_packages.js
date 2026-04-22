const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Package = require('./src/models/Package');

dotenv.config();

const removePackages = async () => {
    try {
        const MONGO_URI = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');

        if (!MONGO_URI) {
            console.error('No Mongo URI found');
            process.exit(1);
        }

        await mongoose.connect(MONGO_URI, {
            dbName: 'agentra'
        });
        console.log('Connected to MongoDB');

        // Find packages with "Dream Vacation" in title
        // Sort by _id to simulate insertion order (often default sort)
        // or just rely on natural order. Explicit sort is better.
        const packages = await Package.find({ title: { $regex: 'Dream Vacation', $options: 'i' } });

        console.log(`Found ${packages.length} packages matching 'Dream Vacation'`);

        if (packages.length === 0) {
            console.log('No packages found.');
            process.exit(0);
        }

        // User asked to remove the "first 2". 
        // We will take the lists as returned.
        const toDelete = packages.slice(0, 2);

        for (const pkg of toDelete) {
            await Package.findByIdAndDelete(pkg._id);
            console.log(`Deleted package: ${pkg.title} (${pkg._id})`);
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

removePackages();
