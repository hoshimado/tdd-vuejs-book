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
    expect(wrapper.find("#id_section_main").exists(),
           "#id_section_mainのdiv要素がない事").to.be.false;
  });

  it('loads with url-query:user and shows main-div.', () => {
    const wrapper = shallowMount(MyClient,{
      propsData: {
        windowLocationHref : '?user=09hoshimado0test1test2test2test3'
      }
    });

    expect(wrapper.find("#id_section_signup").exists(), 
           "#id_section_signupのdiv要素がない事").to.be.false;
    expect(wrapper.find("#id_section_main").is('div')).to.be.true;
  })
})
