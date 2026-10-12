import { Injectable } from '@nestjs/common';
import { serverResponse } from './server-response.js';

@Injectable()
export class AppService {
  getHello() {
    return serverResponse('Hello World!', 'Servidor disponible');
  }
}


class Class1 {
  constructor (){

  }
}

class Class2 {
  class1:Class1;
  constructor(_class1: Class1){
    this.class1 = _class1
  }

}
let class1=new Class1();
let class2=new Class2 (class1);
