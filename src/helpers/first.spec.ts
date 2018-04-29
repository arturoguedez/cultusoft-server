'use strict';
import { expect } from 'chai';
const first = require('./first');
const config = require('config');

describe('first test', function() {
    it('test the addition', function() {
        expect(first.add(1, 2)).to.eql(3);
        expect(3003).to.eql(config.get('server').port);
    });
});
