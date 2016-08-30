import dependable from "../../src.es5/dependable.js";

describe("The dependable module", function () {
    it("which adds the dependable interface to the given class without error when there is no conflict", function () {
        expect(() => dependable(class { })).not.toThrowError();
    });
    
    describe("exposes the \"initDependable\" member", function () {
        it("as a function", function () {
        	expect(dependable.prototype.initDependable).toEqual(jasmine.any(Function));
        });
        
    	it("which initializes an object created by the dependable interface", function () {
            class clazz { }
    	    dependable(clazz);
            
            let dep = new clazz();
            let expr = () => null;
            dep.initDependable(expr);
            
            expect(dep[dependable._dependentsSymbol]).toEqual([]);
            expect(dep[dependable._expressionSymbol]).toBe(expr);
    	});
        
        it("which initializes an object created by the dependable interface while allowing overridden functions", function () {
            class clazz {
                // Override dependable's update
        	    update() { }
            }
            
            spyOn(clazz.prototype, "update");
            spyOn(dependable.prototype, "update");
            
            dependable(clazz);
            
            let dep = new clazz();
            dep.initDependable(() => null);
            dep.update();
            
            expect(clazz.prototype.update).toHaveBeenCalled(); // Should call overridden update()
            expect(dependable.prototype.update).not.toHaveBeenCalled(); // Should NOT call base update()
        });
    });
    
    let createDependable = function (expr = () => null) {
        let clazz = dependable(class { });
        let dep = new clazz();
        dep.initDependable(expr);
        return dep;
    };
    
    describe("exposes the \"instanceof\" member", function () {
    	it("as a static function", function () {
    		expect(dependable.instanceof).toEqual(jasmine.any(Function))
    	});
        
        it("which returns true for objects which implement dependable", function () {
        	expect(dependable.instanceof(createDependable())).toBe(true);
        });
        
        it("which returns false for objects which do not implement dependable", function () {
        	expect(dependable.instanceof({ })).toBe(false);
        });
    });
    
    describe("exposes the \"addDependent\" member", function () {
        it("as a function", function () {
            expect(dependable.prototype.addDependent).toEqual(jasmine.any(Function));
        });
        
        it("which adds the given object as a dependent of this dependable", function () {
            let first = createDependable();
            let second = createDependable();
    
            first.addDependent(second);
            
            expect(first[dependable._dependentsSymbol]).toEqual([ second ]);
        });
    });
    
    describe("exposes the \"trigger\" member", function () {
        it("as a function", function () {
            expect(dependable.prototype.trigger).toEqual(jasmine.any(Function));
        });
        
        it("which triggers the \"update\" method on all this dependable's dependents", function () {
            let first = createDependable();
            let second = createDependable();
            let third = createDependable();
            
            spyOn(second, "update");
            spyOn(third, "update");
            first[dependable._dependentsSymbol] = [ second, third ];
            
            first.trigger();
            
            expect(second.update).toHaveBeenCalled();
            expect(third.update).toHaveBeenCalled();
        });
    });
    
    describe("exposes the \"update\" member", function () {
        it("as a function", function () {
            expect(dependable.prototype.update).toEqual(jasmine.any(Function));
        });
        
        it("which updates this dependable's value with its expression and triggers it", function () {
            let dep = createDependable(() => "foo");
            
            spyOn(dep, "trigger");
    
            dep.update();
            
            expect(dep.value).toBe("foo");
            expect(dep.trigger).toHaveBeenCalled();
        });
    });
});