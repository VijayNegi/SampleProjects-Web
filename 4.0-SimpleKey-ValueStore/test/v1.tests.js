const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); 

chai.use(chaiHttp);
const expect = chai.expect;
let content =  { Name: 'myCar', Fuel: 'Gasoline' }

describe('V1 API', () => {
  describe('POST data/set/', () => {
    it('should set new data in store', (done) => {
      chai.request(app)
        .post('/v1/data/set/car')
        .send(content)
        .end((err, res) => {
          if (err) {
            expect(res).to.have.status(404);
            //expect(res.body).equal('No bucket with name car exists.');
          } else {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('Name');
          }
          done();
        });
    });
  });
});

describe('GET /data/get', () => {
    it('should fetch data from store', (done) => {
      chai.request(app)
        .get('/v1/data/get/car')
        .end((err, res) => {
          if (err) {
            expect(res).to.have.status(404);
            //expect(res.body).equal('No bucket with name car exists.');
          } else {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('Name');
          }
          done();
        });
    });
  });