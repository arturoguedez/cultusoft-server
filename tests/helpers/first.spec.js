'use strict';
const expect = require('chai').expect;
const first = require('../../helpers/first');

describe('first test', function () {
    it('test the addition', function () {
        expect(first.add(1, 2)).to.eql(3);
    });
});
