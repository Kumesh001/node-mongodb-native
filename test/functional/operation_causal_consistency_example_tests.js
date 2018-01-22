'use strict';
const setupDatabase = require('./shared').setupDatabase;
const expect = require('chai').expect;

describe('Causal Consistency Example', function() {
  before(function() {
    return setupDatabase(this.configuration);
  });

  it('does causal consistency', {
    metadata: { requires: { topology: ['single'], mongodb: '>=3.6.0' } },

    test: function(done) {
      const configuration = this.configuration;
      const client = configuration.newClient(configuration.writeConcernMax(), { poolSize: 1 });

      client.connect(function(err, client) {
        const cleanup = e => {
          client.close();
          done(e);
        };

        if (err) return cleanup(err);

        const db = client.db(configuration.db);
        const collection = db.collection('causalConsistencyExample');
        const session = client.startSession({ causalConsistency: true });

        collection.insertOne({ darmok: 'jalad' }, { session });
        collection.updateOne({ darmok: 'jalad' }, { $set: { darmok: 'tanagra' } }, { session });

        const cursor = collection.find({}, { session }).toArray(function(err, data) {
          try {
            expect(err).to.equal(null);
            expect(data).to.exist;
          } catch (e) {
            return cleanup(e);
          }

          cleanup();
        });
      });
    }
  });
});