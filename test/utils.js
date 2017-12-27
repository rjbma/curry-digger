import { expect } from 'chai'
import S from 'sanctuary'
import * as U from '../src/utils/utils'

describe('sequenceObject', () => {
    it('should sequence object with just Justs', () => {
        const obj = {
            title: S.Just('No retreat, no surrender'),
            year: S.Just(1986),
        }
        const expected = S.Just({
            title: 'No retreat, no surrender',
            year: 1986,
        })
        const newObj = U.sequenceObject(S.of(S.Maybe), obj)
        expect(S.equals(newObj, expected)).to.be.true
    })

    it('should sequence object with a Nothing', () => {
        const obj = {
            title: S.Just('No retreat, no surrender'),
            year: S.Nothing,
        }
        const newObj = U.sequenceObject(S.of(S.Maybe), obj)
        expect(S.equals(newObj, S.Nothing)).to.be.true
    })
})
