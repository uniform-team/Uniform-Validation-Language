describe("The parser module", function () {
	it("is exposed globally", function () {
		expect(uniform.parser).toEqual(jasmine.any(Object));
	});
	
	var parser = uniform.parser;
	var parseExpr = function (expr) {
		parser.parse("valid: " + expr + ";");
	};
	
	describe("parses valid inputs such as", function () {
		it("identifier blocks", function () {
			expect(function () {
				parser.parse("test { }")
			}).not.toThrow();
		});
		
		it("variable blocks", function () {
			expect(function () {
				parser.parse("@test { }");
			}).not.toThrow();
		});
		
		it("nested blocks", function () {
			expect(function () {
				parser.parse("test1 { test2 { } }");
			}).not.toThrow();
		});
		
		it("tag statements", function () {
			expect(function () {
				parser.parse("valid: true;");
			}).not.toThrow();
		});
		
		it("variable statements", function () {
			expect(function () {
				parser.parse("@test: true;");
			}).not.toThrow();
		});
		
		it("empty file", function () {
			expect(function () {
				parser.parse("");
			}).not.toThrow();
		});
	});
	
	describe("parses valid expressions", function () {
		describe("with boolean operators such as", function () {
			it("and", function () {
				expect(function () {
					parseExpr("true and true");
				}).not.toThrow();
			});
			
			it("or", function () {
				expect(function () {
					parseExpr("true or true");
				}).not.toThrow();
			});
			
			it("not", function () {
				expect(function () {
					parseExpr("not true");
				}).not.toThrow();
			});
			
			it("chained not", function () {
				expect(function () {
					parseExpr("not not not not true");
				}).not.toThrow();
			});
		});
		
		describe("with comparison operators such as", function () {
			it("equals", function () {
				expect(function () {
					parseExpr("true equals true");
				}).not.toThrow();
			});
			
			it("matches", function () {
				expect(function () {
					parseExpr("\"test\" matches /\"test\"/");
				}).not.toThrow();
			});
			
			it("is", function () {
				expect(function () {
					parseExpr("\"test\" is string");
				}).not.toThrow();
			});
			
			it("<", function () {
				expect(function () {
					parseExpr("1 < 1");
				}).not.toThrow();
			});
			
			it("<=", function () {
				expect(function () {
					parseExpr("1 <= 1");
				}).not.toThrow();
			});
			
			it(">", function () {
				expect(function () {
					parseExpr("1 > 1");
				}).not.toThrow();
			});
			
			it(">=", function () {
				expect(function () {
					parseExpr("1 >= 1");
				}).not.toThrow();
			});
		});
		
		describe("with arithmetic operators such as", function () {
			it("addition", function () {
				expect(function () {
					parseExpr("1 + 1");
				}).not.toThrow();
			});
			
			it("subtraction", function () {
				expect(function () {
					parseExpr("1 - 1");
				}).not.toThrow();
			});
			
			it("multiplication", function () {
				expect(function () {
					parseExpr("1 * 1");
				}).not.toThrow();
			});
			
			it("division", function () {
				expect(function () {
					parseExpr("1 / 1");
				}).not.toThrow();
			});
			
			it("modulo", function () {
				expect(function () {
					parseExpr("1 % 1");
				}).not.toThrow();
			});
			
			it("negation", function () {
				expect(function () {
					parseExpr("- 1");
				}).not.toThrow();
			});
			
			it("chained negation", function () {
				expect(function () {
					parseExpr("- - - - 1");
				}).not.toThrow();
			});
		});
		
		describe("with miscellaneous operators such as", function () {
			it("any", function () {
				expect(function () {
					parseExpr("any @array");
				}).not.toThrow();
			});
			
			it("all", function () {
				expect(function () {
					parseExpr("all @array");
				}).not.toThrow();
			});
			
			it("dot", function () {
				expect(function () {
					parseExpr("first.second");
				}).not.toThrow();
			});
			
			it("paren", function () {
				expect(function () {
					parseExpr("( true )");
				}).not.toThrow();
			});
		});
		
		describe("with operands such as", function () {
			it("identifiers", function () {
				expect(function () {
					parseExpr("test");
				}).not.toThrow();
			});
			
			it("booleans", function () {
				expect(function () {
					parseExpr("true");
				}).not.toThrow();
				
				expect(function () {
					parseExpr("false");
				}).not.toThrow();
			});
			
			it("numbers", function () {
				expect(function () {
					parseExpr("1");
				}).not.toThrow();
			});
			
			it("strings", function () {
				expect(function () {
					parseExpr("\"test\"");
				}).not.toThrow();
			});
			
			it("regular expressions", function () {
				expect(function () {
					parseExpr("/\"test\"/");
				}).not.toThrow();
			});
			
			it("variables", function () {
				expect(function () {
					parseExpr("@test");
				}).not.toThrow();
			});
			
			it("states", function () {
				expect(function () {
					parseExpr("string");
				}).not.toThrow();
				
				expect(function () {
					parseExpr("number");
				}).not.toThrow();
			});
			
			it("this keyword", function () {
				expect(function () {
					parseExpr("this");
				}).not.toThrow();
			});
			
			it("empty objects", function () {
				expect(function () {
					parseExpr("{ }");
				}).not.toThrow();
			});
			
			it("key-value pair objects", function () {
				expect(function () {
					parseExpr("{ test: true; }");
				});
			});
			
			it("multi key-value pair objects", function () {
				expect(function () {
					parseExpr("{ test: true; test2: false; }")
				});
			});
		});
	});
	
	describe("throws an error when given invalid expressions such as", function () {
		it("following a block with a non-block and non-statement", function () {
			expect(function () {
				parser.parse("test { } true");
			}).toThrow();
		});
		
		it("using a non-block and non-statement as a block or statement", function () {
			expect(function () {
				parser.parse("true");
			}).toThrow();
		});
		
		it("following a variable (when in block) with a non-block and non-statement", function () {
			expect(function () {
				parser.parse("@test;");
			}).toThrow();
		});
		
		it("chaining and / all", function () {
			expect(function () {
				parseExpr("any all @array");
			}).toThrow();
		});
		
		it("using a non-operand as an operand", function () {
			expect(function () {
				parseExpr("any :");
			}).toThrow();
		});
	});
});