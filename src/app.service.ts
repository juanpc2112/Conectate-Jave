import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
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
