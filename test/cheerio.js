import { expect } from 'chai'
import S from 'sanctuary'
import R from 'ramda'
import * as C from '../src/utils/cheerio'

describe('cheerio selectors', () => {
    describe('selectElements', () => {
        const html = `
            <ul id="fruits">
                <li class="apple">Apple<span>iei</span></li>
                <li class="orange">Orange</li>
                <li class="pear">Pear</li>
            </ul>`
        const html2 = `
            <div class="parent">
                <span class="child">yes!</span>
            </div>`

        it('should select all lis', () => {
            const elemCount = R.compose(R.length, C.selectAll('ul li'), C.loadDom)(html)
            expect(elemCount).to.equal(3)    
        })

        it('should select an existing element', () => {
            const elem = R.compose(R.map(C.text), C.selectFirst('ul li.orange'), C.loadDom)(html)
            expect(S.equals(elem, S.Just('Orange'))).to.be.true
        })

        it('should not select an element that does not exist', () => {
            const elem = R.compose(R.map(C.text), C.selectFirst('ul li.black'), C.loadDom)(html)
            expect(S.equals(elem, S.Nothing)).to.be.true
        })

        it('should select the text of an element, including its children', () => {
            const elem = R.compose(R.map(C.text), C.selectFirst('.apple'), C.loadDom)(html)
            expect(S.equals(elem, S.Just('Appleiei'))).to.be.true
        })

        it('should only select the inner text of an element', () => {
            const elem = R.compose(R.map(C.innerText), C.selectFirst('.apple'), C.loadDom)(html)
            expect(S.equals(elem, S.Just('Apple'))).to.be.true
        })

        it('should select the value of an attribute', () => {
            const id = R.compose(R.chain(C.attr('id')), C.selectFirst('ul'), C.loadDom)(html)
            expect(S.equals(id, S.Just('fruits'))).to.be.true
        })

        it('should NOT select the value of an attribute that does not exist', () => {
            const id = R.compose(R.chain(C.attr('value')), C.selectFirst('ul'), C.loadDom)(html)
            expect(S.equals(id, S.Nothing)).to.be.true
        })

        it('should work for required elements that DO exist', () => {
            const elem = R.compose(C.required('ERR', '.orange'), C.loadDom)(html)
            expect(S.equals(elem, S.Right('Orange')))
        })

        it('should work for required elements that DON\'t exist', () => {
            const elem = R.compose(C.required('ERR', '.black'), C.loadDom)(html)
            expect(S.equals(elem, S.Left('ERR')))
        })

        it('should work for optional elements that DO exist', () => {
            const elem = R.compose(C.optional('Fuscia', '.orange'), C.loadDom)(html)
            expect(S.equals(elem, 'Orange'))
        })

        it("should work for optional elements that DON't exist", () => {
            const elem = R.compose(C.optional('Fuscia', '.black'), C.loadDom)(html)
            expect(elem).to.equal('Fuscia')
        })
    })
})
