import { shallowMount } from '@vue/test-utils';
import { expect } from 'chai';
import MyClient from '@/components/MyClient.vue';


describe('MyClient.vue', () => {
  const factory = (propsData)=>{
    return shallowMount(MyClient,{
      propsData: {
        ...propsData
      }
    });
  };
  it('loads without url-query and shows signup-div', () => {
    const wrapper = factory();
    
    expect(wrapper.find("#id_section_signup").is('div')).to.be.true;
    expect(wrapper.find("#id_section_main").exists(), "#id_section_mainのdiv要素がない事").to.be.false;
    // https://vue-test-utils.vuejs.org/ja/api/wrapper/find.html
    // https://vue-test-utils.vuejs.org/ja/api/wrapper/#exists
  });

  it('loads with url-query:user and shows main-div.', () => {
    const wrapper = shallowMount(MyClient,{
      propsData: {
        windowLocationHref : '?user=09hoshimado0test1test2test2test3'
      }
    });
    // https://lmiller1990.github.io/vue-testing-handbook/ja/rendering-a-component.html#%E3%82%B3%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%8D%E3%83%B3%E3%83%88%E3%82%92%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E3%81%99%E3%82%8B%E4%BA%8C%E3%81%A4%E3%81%AE%E3%83%A1%E3%82%BD%E3%83%83%E3%83%89-mount%E3%81%A8shallowmount

    // console.log("[]"+wrapper.html());
    expect(wrapper.find("#id_section_signup").exists(), "#id_section_signupのdiv要素がない事").to.be.false;
    expect(wrapper.find("#id_section_main").is('div')).to.be.true;
  })
})
