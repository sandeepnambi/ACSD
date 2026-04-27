# Sample Python code for testing code smell detection

class BadCodeExample:
    def __init__(self, param1, param2, param3, param4, param5, param6, param7):
        self.param1 = param1
        self.param2 = param2
        self.param3 = param3
        self.param4 = param4
        self.param5 = param5
        self.param6 = param6
        self.param7 = param7
    
    def very_long_method_that_does_too_many_things(self, data):
        # This method is intentionally long to trigger the "long method" smell
        result = []
        for item in data:
            if item > 0:
                result.append(item * 2)
            else:
                result.append(item * 3)
        
        # More unnecessary complexity
        temp = []
        for i in range(len(result)):
            if result[i] % 2 == 0:
                temp.append(result[i] / 2)
            else:
                temp.append(result[i] * 2)
        
        # Even more complexity
        final_result = []
        for value in temp:
            if value > 100:
                final_result.append(value - 100)
            elif value > 50:
                final_result.append(value - 50)
            else:
                final_result.append(value)
        
        # And more lines...
        for i in range(10):
            final_result.append(i * i)
        
        for i in range(5):
            final_result.append(i * i * i)
        
        return final_result
    
    def duplicate_method(self, data):
        # This method will be duplicated
        result = []
        for item in data:
            if item > 0:
                result.append(item * 2)
            else:
                result.append(item * 3)
        return result
    
    def duplicate_method_v2(self, data):
        # Duplicate of the above method
        result = []
        for item in data:
            if item > 0:
                result.append(item * 2)
            else:
                result.append(item * 3)
        return result
    
    def method1(self):
        pass
    
    def method2(self):
        pass
    
    def method3(self):
        pass
    
    def method4(self):
        pass
    
    def method5(self):
        pass
    
    def method6(self):
        pass
    
    def method7(self):
        pass
    
    def method8(self):
        pass
    
    def method9(self):
        pass
    
    def method10(self):
        pass
    
    def method11(self):
        pass
    
    def method12(self):
        pass
    
    def method13(self):
        pass
    
    def method14(self):
        pass
    
    def method15(self):
        pass
    
    def method16(self):
        pass
    
    def method17(self):
        pass
    
    def method18(self):
        pass
    
    def method19(self):
        pass
    
    def method20(self):
        pass
    
    def method21(self):
        pass
    
    def method22(self):
        pass
    
    def method23(self):
        pass
    
    def method24(self):
        pass
    
    def method25(self):
        pass
    
    def method26(self):
        pass
    
    def method27(self):
        pass
    
    def method28(self):
        pass
    
    def method29(self):
        pass
    
    def method30(self):
        pass
    
    def method31(self):
        pass
    
    def method32(self):
        pass
    
    def method33(self):
        pass
    
    def method34(self):
        pass
    
    def method35(self):
        pass
    
    def method36(self):
        pass
    
    def method37(self):
        pass
    
    def method38(self):
        pass
    
    def method39(self):
        pass
    
    def method40(self):
        pass
    
    def method41(self):
        pass
    
    def method42(self):
        pass
    
    def method43(self):
        pass
    
    def method44(self):
        pass
    
    def method45(self):
        pass
    
    def method46(self):
        pass
    
    def method47(self):
        pass
    
    def method48(self):
        pass
    
    def method49(self):
        pass
    
    def method50(self):
        pass
