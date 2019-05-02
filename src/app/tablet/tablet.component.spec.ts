import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabletComponent } from './tablet.component';
import { ElementRef } from '@angular/core';

class MockElementRef implements ElementRef {
  nativeElement = {};
}

describe('Tablet\tabletComponent', () => {
  let component: TabletComponent;
  let fixture: ComponentFixture<TabletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabletComponent ],
      providers: [
        { provide: ElementRef, useClass: MockElementRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
