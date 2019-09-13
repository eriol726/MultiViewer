import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiddleComponent } from './middle.component';
import { ElementRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

class MockElementRef implements ElementRef {
  nativeElement = {};
}

describe('MiddleComponent', () => {
  let component: MiddleComponent;
  let fixture: ComponentFixture<MiddleComponent>;

  // beforeEach(() => {
  //   providers: [
  //     { provide: ElementRef, useClass: MockElementRef }
  //   ]
  // });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiddleComponent ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        { provide: ElementRef, useClass: MockElementRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiddleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
