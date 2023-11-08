var MOS6510AddressingModes = {};
MOS6510AddressingModes.IMMED = 0; /* Immediate */
MOS6510AddressingModes.ABSOL = 1; /* Absolute */
MOS6510AddressingModes.ZEROP = 2; /* Zero Page */
MOS6510AddressingModes.IMPLI = 3; /* Implied */
MOS6510AddressingModes.INDIA = 4; /* Indirect Absolute */
MOS6510AddressingModes.ABSIX = 5; /* Absolute indexed with X */
MOS6510AddressingModes.ABSIY = 6; /* Absolute indexed with Y */
MOS6510AddressingModes.ZEPIX = 7; /* Zero page indexed with X */
MOS6510AddressingModes.ZEPIY = 8; /* Zero page indexed with Y */
MOS6510AddressingModes.INDIN = 9; /* Indexed indirect (with X) */
MOS6510AddressingModes.ININD = 10; /* Indirect indexed (with Y) */
MOS6510AddressingModes.RELAT = 11; /* Relative */
MOS6510AddressingModes.ACCUM = 12; /* Accumulator */  


var MOS6510Cycles = {};
MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE = 1;
MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE = 2;

//  https://www.c64-wiki.com/wiki/LDA
//http://6502.org/tutorials/65c02opcodes.html

var MOS6510OpcodeCmds = [
  { 
    "cmd": "ADC", 
    "name": "ADd with Carry", 
    "desc": "Adds the byte held in the accumulator with that held in the memory address specified together with the carry bit. If overflow occurs the carry bit is set", 
    "flags": "NVZC",
    "flagInfo": {
      "N": "Set if bit 7 set",
      "V": "Set if sign bit is incorrect",
      "Z": "Set if A = 0",
      "C": "Set if overflow in bit 7",
    }
  },
  { 
    "cmd": "AND", 
    "name": "Logic AND", 
    "desc": "Performs a bit-wise boolean 'and' between the eight bits in the operand and the eight bits of the accumulator", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if bit 7 set",
      "Z": "Set if A = 0",
    }
  },
  { 
    "cmd": "ANC", 
    "name": "AND, ASL/ROL", 
    "desc": "Illegal Opcode:  ANDs the contents of the A register with an immediate value and then moves bit 7 of A into the Carry flag. ",
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if bit 7 set",
      "Z": "Set if A = 0",
    }
  },

  { 
    "cmd": "ASL", 
    "name": "Arithmetic Shift Left", 
    "desc": "Shifts all the bits of the accumulator or memory contents one bit left. Bit 0 is set to 0 and bit 7 is placed in the carry flag.", 
    "flags": "NZC",
    "flagInfo": {
      "N": "Set if bit 7 of the result is set",
      "Z": "Set if A = 0",
      "C": "Set to contents of old bit 7",
    }
  },
  { 
    "cmd": "ALR", 
    "name": "AND then Logical shift Right", 
    "desc": "Illegal Opcode:  AND then Logical shift Right ",
    "flags": "NZC",
    "flagInfo": {
      "N": "Always cleared",
      "Z": "Set if the result is zero, or cleared if it is non-zero.",
      "C": "Has the value of accumulator's bit 0 if bit 0 of the mask is 1 or cleared otherwise"
    }
  },

  { 
    "cmd": "BCC", 
    "name": "Branch if Carry is Clear", 
    "desc": "Branches to the address specified if, and only if the carry flag is clear.", 
    "flags": "none" 
  },
  { 
    "cmd": "BCS", 
    "name": "Branch if Carry is Set", 
    "desc": "Branches to the address specified if, and only if the carry flag is set", 
    "flags": "none" 
  },
  { 
    "cmd": "BEQ", 
    "name": "Branch if EQual", 
    "desc": "Branches to the address specified if, and only if the zero flag is set", 
    "flags": "none" 
  },
  { 
    "cmd": "BIT", 
    "name": "BIT test", 
    "desc": "Test if one or more bits are set in a target memory location. The mask pattern in A is ANDed with the value in memory to set or clear the zero flag, the result is not kept", 
    "flags": "NVZ",
    "flagInfo": {
      "N": "Set to bit 7 of the memory value",
      "V": "Set to bit 6 of the memory value",
      "Z": "Set if the result of the AND is zero"
    }

  },
  { 
    "cmd": "BMI", 
    "name": "Branch if MInus", 
    "desc": "Branches to the address specified if, and only if the negative flag is set", 
    "flags": "none" 
  },
  { 
    "cmd": "BNE", 
    "name": "Branch if Not Equal", 
    "desc": "Branches to the address specified if, and only if the zero flag is clear", 
    "flags": "none" 
  },
  { 
    "cmd": "BPL", 
    "name": "Branch if PLus", 
    "desc": "Branches to the address specified if, and only if the negative flag is clear.", 
    "flags": "none" 
  },
  { 
    "cmd": "BRK", 
    "name": "BReaKpoint", 
    "desc": "Sets the break and interrupt flags, increments the program counter by two and stores it along with the processor status flags onto the stack. Finally it raises an IRQ interrupt event.", 
    "flags": "B",
    "flagInfo": {
      "B": "Set to 1"
    }
  },
  { 
    "cmd": "BVC", 
    "name": "Branch if oVerflow Clear", 
    "desc": "Branches to the address specified if, and only if the overflow flag is clear.", 
    "flags": "none" 
  },
  { 
    "cmd": "BVS", 
    "name": "Branch if oVerflow Set", 
    "desc": "Branches to the address specified if, and only if the overflow flag is set", 
    "flags": "none" 
  },
  { 
    "cmd": "CLC", 
    "name": "CLear Carry", 
    "desc": "Clears the carry flag.", 
    "flags": "C",
    "flagInfo": {
      "C": "Set to 0"
    }
  },
  { 
    "cmd": "CLD", 
    "name": "CLear Decimal flag", 
    "desc": "Clears the decimal flag", 
    "flags": "D",
    "flagInfo": {
      "D": "Set to 0"
    }
  },
  { 
    "cmd": "CLI", 
    "name": "CLear Interrupt flag", 
    "desc": "Clears the interrupt flag", 
    "flags": "I",
    "flagInfo": {
      "I": "Set to 0"
    }
  },
  { 
    "cmd": "CLV", 
    "name": "CLear oVerflow", 
    "desc": "clears the Overflow flag", 
    "flags": "V", 
    "flagInfo": {
      "V": "Set to 0"
    }
  },
  { 
    "cmd": "CMP", 
    "name": "CoMPare", 
    "desc": "Compares the contents of the accumulator against that of the specified operand by subtracting operand from accumulator value, and setting the negative and carry flags according to the result", 
    "flags": "NZC",
    "flagInfo": {
      "N": "Set if bit 7 of the result is set",
      "Z": "Set if A is equal",
      "C": "Set if A is greater or equal"
    }
    
  },
  { 
    "cmd": "CPX", 
    "name": "ComPare X", 
    "desc": "Compares the contents of the X index register against that of the specified operand by subtracting the latter from the former, and setting the negative and carry flags according to the result", 
    "flags": "NZC",
    "flagInfo": {
      "N": "Set if bit 7 of the result is set",
      "Z": "Set if X is equal",
      "C": "Set if X is greater or equal"
    }
  },
  { 
    "cmd": "CPY", 
    "name": "ComPare Y", 
    "desc": "Compares the contents of the Y index register against that of the specified operand by subtracting the latter from the former, and setting the negative and carry flags according to the result. ", 
    "flags": "NZC",
    "flagInfo": {
      "N": "Set if bit 7 of the result is set",
      "Z": "Set if Y is equal",
      "C": "Set if Y is greater or equal"
    }
  },
  { 
    "cmd": "DEC", 
    "name": "DECrease", 
    "desc": "Decrements the numerical value of the contents of the address specified, by one, and 'wraps over' if the value goes below the numerical limits of a byte", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    }
  },
  { 
    "cmd": "DEX", 
    "name": "DEcrement X register", 
    "desc": "Decrements the content of the X Register by 1", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    }
  },
  { 
    "cmd": "DEY", 
    "name": "DEcrement Y register", 
    "desc": "Decrements the content of the Y Register by 1", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    }
  },
  { 
    "cmd": "EOR", 
    "name": "Exclusive OR", 
    "desc": "Performs a bit-wise boolean \"Exclusive-or\" between each of the eight bits in the accumulator and their corresponding bits in the memory address specified. The eight resulting bits form a byte, which is stored in the accumulator.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    }
  },
  { 
    "cmd": "INC", 
    "name": "INCrease", 
    "desc": "Increases the numerical value of the contents of the address specified by one, and \"wraps over\" when the numerical limits of a byte are exceeded", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    }
  },
  { 
    "cmd": "INX", 
    "name": "INcrease X", 
    "desc": "Increases the numerical value held in the X index register by one, and \"wraps over\" when the numerical limits of a byte are exceeded.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    }
  },
  { 
    "cmd": "INY",
    "name": "INcrease Y", 
    "desc": "Increases the numerical value held in the Y index register by one, and \"wraps over\" when the numerical limits of a byte are exceeded.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    } 
  },
  { 
    "cmd": "JMP", 
    "name": "JuMP", 
    "desc": "Unconditionally transfers program execution to the specified address.", 
    "flags": "none" 
  },
  { 
    "cmd": "JSR", 
    "name": "Jump to SubRoutine", 
    "desc": "Calls a subroutine", 
    "flags": "none" 
  },
  { 
    "cmd": "LAX", 
    "name": "LDA, LDX", 
    "desc": "Illegal Opcode:  Combination of LDA and LDX ",
    "flags": "NZC",
    "flagInfo": {
      "N": "Always cleared",
      "Z": "Set if the result is zero, or cleared if it is non-zero.",
      "C": "Has the value of accumulator's bit 0 if bit 0 of the mask is 1 or cleared otherwise"
    }
  },

  { 
    "cmd": "LDA", 
    "name": "LoaD Accumulator", 
    "desc": "Retrieves a copy from the specified RAM or I/O address, and stores it in the accumulator.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    } 
  },
  { 
    "cmd": "LDX", 
    "name": "LoaD X register", 
    "desc": "Retrieves a copy from the specified RAM or I/O address, and stores it in the X register.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    }      
  },
  { 
    "cmd": "LDY", 
    "name": "LoaD Y register", 
    "desc": "Retrieves a copy from the specified RAM or I/O address, and stores it in the Y register.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    }       
  },
  { 
    "cmd": "LSR", 
    "name": "Logic Shift Right", 
    "desc": "Shifts the bits in either the accumulator or a specified address in RAM, one bit position towards the right, or least significant end of the byte. The bit previously held at the least significant position is shifted out of the byte, and into the carry flag, whereas the most significant bit, left empty by the shift operation, is filled in with a zero bit.", 
    "flags": "NZC",
    "flagInfo": {
      "N": "Set to 0",
      "Z": "Cleared unless the operand is zero",
      "C": "Set to the least significant bit (bit 0) of the operand prior to shifting"
    }        
  },
  { 
    "cmd": "NOP", 
    "name": "No OPeration", 
    "desc": "Causes no changes to the processor other than the normal incrementing of the program counter to the next instruction", 
    "flags": "none" 
  },
  { 
    "cmd": "ORA", 
    "name": "Logical OR on Accumulator", 
    "desc": "Performs a bit-wise boolean \"or\" between each of the eight bits in the accumulator and their corresponding bits in the memory address specified. The eight resulting bits form a byte, which is stored in the accumulator.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero"
    }         
  },
  { 
    "cmd": "PHA", 
    "name": "PusH Accumulator", 
    "desc": "Stores a copy of the current content of the accumulator onto the stack and adjusts the stack pointer to reflect the addition.", 
    "flags": "" 
  },
  { 
    "cmd": "PHP", 
    "name": "PusH Processor flags", 
    "desc": "Stores the current state of the processor status flags onto the stack and adjusts the stack pointer to reflect the addition.", 
    "flags": "" 
  },
  { 
    "cmd": "PLA", 
    "name": "PulL Accumulator", 
    "desc": "Retrieves a byte from the stack and stores it in the accumulator, and adjusts the stack pointer to reflect the removal of that byte", 
    "flags": "" 
  },
  { 
    "cmd": "PLP", 
    "name": "PulL Processor flags", 
    "desc": "Retrieves a set of status flags  from the stack, and adjusts the stack pointer to reflect the removal of a byte.", 
    "flags": "" 
  },
  { 
    "cmd": "RLA",
    "name": "RoL with And",
    "desc": "Illegal Opcode:  ROLs the contents of a memory location and then ANDs the result with the accumulator.",
    "flags": "NZC",
    "flagInfo": {
      
    }
  },
  { 
    "cmd": "ROL", 
    "name": "ROtate Left", 
    "desc": "Shifts the bits in either the accumulator or a specified address in RAM, one bit position towards the left, or most significant end of the byte. The least significant bit, left empty by the shift operation, is filled in with the bit held in the carry flag prior to the ROL instruction, and the excess bit that gets pushed out of the most significant end, is subsequently placed in the carry flag.", 
    "flags": "NZC",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero",
      "C": "Set to contents of old bit 7",
    }          
  },
  { 
    "cmd": "ROR", 
    "name": "ROtate Right", 
    "desc": "Shifts the bits in either the accumulator or a specified address in RAM, one bit position towards the right, or least significant end of the byte. The most significant bit, is set to the value in the carry flag. Similarly, what was the least significant bit in the byte prior to the shifting, will subsequently be rotated into the carry flag.", 
    "flags": "NZC",
    "flagInfo": {
      "N": "Set if the result is negative",
      "Z": "Set if the result is zero",
      "C": "Set to contents of old bit 0",
    }          
  },
  { 
    "cmd": "RTI", 
    "name": "ReTurn from Interrupt", 
    "desc": "returns the CPU from an interrupt service routine to the \"mainline\" program that was interrupted. It does this by pulling first the processor status flags (similar to PLP), and then the program counter, from the stack, effectively handling program execution back to the address pulled from the stack.", 
    "flags": "NVBDIZC" 
  },
  { 
    "cmd": "RTS", 
    "name": "ReTurn from Subroutine", 
    "desc": "Returns the CPU from a subroutine to the part of the program which initially called the subroutine;", 
    "flags": "" 
  },
  { 
    "cmd": "SBC", 
    "name": "SuBtract with Carry", 
    "desc": "subtracts the byte held at the specified memory address, from the one currently held in the accumulator, leaving the result in the accumulator: The state of the carry flag before the subtraction takes place, is taken as an incoming \"borrow\" flag in the computation", 
    "flags": "NVZC",
    "flagInfo": {
      "N": "Set if the result is negative",
      "V": " set if the operation results in an overflow",
      "Z": "Set if the result is zero",
      "C": "Clear if overflow in bit 7",
    }          
  },

  { 
    "cmd": "SBX", 
    "name": "CMP, DEX", 
    "desc": "Illegal Opcode:  Combination of CMP and DEX",
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if bit 7 set",
      "Z": "Set if A = 0",
    }
  },

  { 
    "cmd": "SEC", 
    "name": "SEt Carry", 
    "desc": "Unconditionally sets the carry flag",
    "flags": "C",
    "flagInfo": {
      "C": "Set unconditionally",
    }
  },
  { 
    "cmd": "SED", 
    "name": "SEt Decimal flag", 
    "desc": "Sets the decimal flag", 
    "flags": "D",
    "flagInfo": {
      "D": "Set unconditionally",
    }
  },
  { 
    "cmd": "SEI",
    "name": "SEt Interrupt flag", 
    "desc": "Sets the interrupt flag, thereby preventing the CPU from responding to IRQ interrupt events", 
    "flags": "I",
    "flagInfo": {
      "I": "Set unconditionally",
    }
  },
  
  { 
    "cmd": "SLO", 
    "name": "AND, ASL/ROL", 
    "desc": "Illegal Opcode:  ANDs the contents of the A register with an immediate value and then moves bit 7 of A into the Carry flag. ",
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if bit 7 set",
      "Z": "Set if A = 0",
    }
  },


  { 
    "cmd": "STA", 
    "name": "STore Accumulator", 
    "desc": "Stores a copy of the byte held in the accumulator at the RAM or I/O address specified.", 
    "flags": "" 
  },
  { 
    "cmd": "STX", 
    "name": "STore X", 
    "desc": "Stores a copy of the byte held in the X register at the RAM or I/O address specified", 
    "flags": "" 
  },
  { 
    "cmd": "STY", 
    "name": "STore Y", 
    "desc": "Stores a copy of the byte held in the Y index register at the RAM or I/O address specified", 
    "flags": "" 
  },
  { 
    "cmd": "TAX", 
    "name": "Transfer Accumulator to X", 
    "desc": "Copies the contents of the accumulator to the X register.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the byte transferred is negative",
      "Z": "Set if the byte transferred is zeroy"
    }

  },
  { 
    "cmd": "TAY", 
    "name": "Transfer Accumulator to Y", 
    "desc": "Copies the contents of the accumulator to the Y register.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the byte transferred is negative",
      "Z": "Set if the byte transferred is zeroy"
    }
  },
  { 
    "cmd": "TSX", 
    "name": "Transfer Stack pointer to X", 
    "desc": "Copies the contents of the stack pointer into the X index register.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the byte transferred is negative",
      "Z": "Set if the byte transferred is zeroy"
    }
  },
  { 
    "cmd": "TXA", 
    "name": "Transfer X to Accumulator", 
    "desc": "Copies the contents of the X register into the accumulator.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the byte transferred is negative",
      "Z": "Set if the byte transferred is zeroy"
    } 
  },
  { 
    "cmd": "TXS", 
    "name": "Transfer X to Stack pointer", 
    "desc": "Copies the contents of the X index register into the stack pointer", 
    "flags": "" 
  },
  { 
    "cmd": "TYA", 
    "name": "Transfer Y to Accumulator", 
    "desc": "Copies the contents of the Y index register into the accumulator.", 
    "flags": "NZ",
    "flagInfo": {
      "N": "Set if the byte transferred is negative",
      "Z": "Set if the byte transferred is zeroy"
    } 
  },
  { "cmd": "???", "name": "", "desc": "", "flags": "" }
];

// https://www.c64-wiki.com/wiki/LDA
// https://codebase64.org/lib/exe/fetch.php?media=base:nomoresecrets-nmos6510unintendedopcodes-20202412.pdf

var MOS6510Opcodes = [
  {"opcode": 0x00, "cmd": "BRK", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 7}, /* BRK */
  {"opcode": 0x01, "cmd": "ORA", "example": "", "addressing": MOS6510AddressingModes.INDIN, "bytes": 2, "cycles": 6},
  {"opcode": 0x02, "cmd": "???", "bytes": 1 },
  {"opcode": 0x03, "cmd": "SLO", "bytes": 2, "illegal": true, "addressing": MOS6510AddressingModes.INDIN },
  {"opcode": 0x04, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP },
  {"opcode": 0x05, "cmd": "ORA", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0x06, "cmd": "ASL", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 5},
  {"opcode": 0x07, "cmd": "SLO", "bytes": 2, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP },
  {"opcode": 0x08, "cmd": "PHP", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 3}, /* PHP */
  {"opcode": 0x09, "cmd": "ORA", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* ORA */
  {"opcode": 0x0A, "cmd": "ASL", "example": "", "addressing": MOS6510AddressingModes.ACCUM, "bytes": 1, "cycles": 2}, /* ASL */
  {"opcode": 0x0B, "cmd": "ANC", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2},
  {"opcode": 0x0C, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSOL },
  {"opcode": 0x0D, "cmd": "ORA", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0x0E, "cmd": "ASL", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 6},
  {"opcode": 0x0F, "cmd": "SLO", "bytes": 3, "illegal": true, "addressing": MOS6510AddressingModes.ABSOL  },

  {"opcode": 0x10, "cmd": "BPL", "example": "", "addressing": MOS6510AddressingModes.RELAT, "bytes": 2, "cycles": 2, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE | MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE}, /* BPL */
  {"opcode": 0x11, "cmd": "ORA", "example": "", "addressing": MOS6510AddressingModes.ININD, "bytes": 2, "cycles": 5, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x12, "cmd": "???", "bytes": 1 },
  {"opcode": 0x13, "cmd": "SLO", "bytes": 2, "illegal": true,  "addressing": MOS6510AddressingModes.ININD },
  {"opcode": 0x14, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX },
  {"opcode": 0x15, "cmd": "ORA", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0x16, "cmd": "ASL", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 6},
  {"opcode": 0x17, "cmd": "SLO", "bytes": 2, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX },
  {"opcode": 0x18, "cmd": "CLC", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* CLC */
  {"opcode": 0x19, "cmd": "ORA", "example": "", "addressing": MOS6510AddressingModes.ABSIY, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x1A, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMPLI },
  {"opcode": 0x1B, "cmd": "SLO", "bytes": 3, "illegal": true, "addressing": MOS6510AddressingModes.ABSIY },
  {"opcode": 0x1C, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX },
  {"opcode": 0x1D, "cmd": "ORA", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x1E, "cmd": "ASL", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 7},
  {"opcode": 0x1F, "cmd": "SLO", "bytes": 3, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX },

  {"opcode": 0x20, "cmd": "JSR", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 6}, /* JSR */
  {"opcode": 0x21, "cmd": "AND", "example": "", "addressing": MOS6510AddressingModes.INDIN, "bytes": 2, "cycles": 6},
  {"opcode": 0x22, "cmd": "???", "bytes": 1 },
  {"opcode": 0x23, "cmd": "RLA", "bytes": 2, "illegal": true, "cycles": 8 },
  {"opcode": 0x24, "cmd": "BIT", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3}, /* BIT */
  {"opcode": 0x25, "cmd": "AND", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0x26, "cmd": "ROL", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 5},
  {"opcode": 0x27, "cmd": "RLA", "bytes": 2, "illegal": true, "cycles": 5 },
  {"opcode": 0x28, "cmd": "PLP", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 4}, /* PLP */
  {"opcode": 0x29, "cmd": "AND", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* AND */
  {"opcode": 0x2A, "cmd": "ROL", "example": "", "addressing": MOS6510AddressingModes.ACCUM, "bytes": 1, "cycles": 2}, /* ROL */
  {"opcode": 0x2B, "cmd": "ANC", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2},
  {"opcode": 0x2C, "cmd": "BIT", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0x2D, "cmd": "AND", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0x2E, "cmd": "ROL", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 6},
  {"opcode": 0x2F, "cmd": "RLA", "bytes": 3, "cycles": 6, "illegal": true },


  {"opcode": 0x30, "cmd": "BMI", "example": "", "addressing": MOS6510AddressingModes.RELAT, "bytes": 2, "cycles": 2, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE | MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE}, /* BMI */
  {"opcode": 0x31, "cmd": "AND", "example": "", "addressing": MOS6510AddressingModes.ININD, "bytes": 2, "cycles": 5, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x32, "cmd": "???", "bytes": 1 },
  {"opcode": 0x33, "cmd": "RLA", "bytes": 2, "illegal": true, "cycles": 8 },
  {"opcode": 0x34, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX  },
  {"opcode": 0x35, "cmd": "AND", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0x36, "cmd": "ROL", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 6},
  {"opcode": 0x37, "cmd": "RLA", "bytes": 2, "illegal": true, "cycles": 6 },
  {"opcode": 0x38, "cmd": "SEC", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* SEC */
  {"opcode": 0x39, "cmd": "AND", "example": "", "addressing": MOS6510AddressingModes.ABSIY, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x3A, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMPLI },
  {"opcode": 0x3B, "cmd": "RLA", "bytes": 3, "cycles": 7, "illegal": true },
  {"opcode": 0x3C, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX  },
  {"opcode": 0x3D, "cmd": "AND", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x3E, "cmd": "ROL", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 7},
  {"opcode": 0x3F, "cmd": "RLA", "bytes": 3, "cycles": 7, "illegal": true },

  {"opcode": 0x40, "cmd": "RTI", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 6}, /* RTI */
  {"opcode": 0x41, "cmd": "EOR", "example": "", "addressing": MOS6510AddressingModes.INDIN, "bytes": 2, "cycles": 6},
  {"opcode": 0x42, "cmd": "???", "bytes": 1 },
  {"opcode": 0x43, "cmd": "SRE", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ININD },
  {"opcode": 0x44, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP  },
  {"opcode": 0x45, "cmd": "EOR", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0x46, "cmd": "LSR", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 5},
  {"opcode": 0x47, "cmd": "SRE", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP  },
  {"opcode": 0x48, "cmd": "PHA", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 3}, /* PHA */
  {"opcode": 0x49, "cmd": "EOR", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* EOR */
  {"opcode": 0x4A, "cmd": "LSR", "example": "", "addressing": MOS6510AddressingModes.ACCUM, "bytes": 1, "cycles": 2}, /* LSR */
  {"opcode": 0x4B, "cmd": "ALR", "bytes": 2, "illegal": true, "addressing": MOS6510AddressingModes.IMMED  },
  {"opcode": 0x4C, "cmd": "JMP", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 3}, /* JMP */
  {"opcode": 0x4D, "cmd": "EOR", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0x4E, "cmd": "LSR", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 6},
  {"opcode": 0x4F, "cmd": "SRE", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSOL  },

  {"opcode": 0x50, "cmd": "BVC", "example": "", "addressing": MOS6510AddressingModes.RELAT, "bytes": 2, "cycles": 2, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE | MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE}, /* BVC */
  {"opcode": 0x51, "cmd": "EOR", "example": "", "addressing": MOS6510AddressingModes.ININD, "bytes": 2, "cycles": 5, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x52, "cmd": "???", "bytes": 1 },
  {"opcode": 0x53, "cmd": "SRE", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ININD },
  {"opcode": 0x54, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX  },
  {"opcode": 0x55, "cmd": "EOR", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0x56, "cmd": "LSR", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 6},
  {"opcode": 0x57, "cmd": "SRE", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX },
  {"opcode": 0x58, "cmd": "CLI", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* CLI */
  {"opcode": 0x59, "cmd": "EOR", "example": "", "addressing": MOS6510AddressingModes.ABSIY, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x5A, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMPLI  },
  {"opcode": 0x5B, "cmd": "SRE", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIY  },
  {"opcode": 0x5C, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX  },
  {"opcode": 0x5D, "cmd": "EOR", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x5E, "cmd": "LSR", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 7},
  {"opcode": 0x5F, "cmd": "SRE", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX  },

  {"opcode": 0x60, "cmd": "RTS", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 6}, /* RTS */
  {"opcode": 0x61, "cmd": "ADC", "example": "ADC (nn,X)", "addressing": MOS6510AddressingModes.INDIN, "bytes": 2, "cycles": 6},
  {"opcode": 0x62, "cmd": "???", "bytes": 1 },
  {"opcode": 0x63, "cmd": "RRA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.INDIN  },
  {"opcode": 0x64, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP  },
  {"opcode": 0x65, "cmd": "ADC", "example": "ADC nn","addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0x66, "cmd": "ROR", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 5},
  {"opcode": 0x67, "cmd": "RRA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP },
  {"opcode": 0x68, "cmd": "PLA", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 4}, /* PLA */
  {"opcode": 0x69, "cmd": "ADC", "example": "ADC #nn", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* ADC */
  {"opcode": 0x6A, "cmd": "ROR", "example": "", "addressing": MOS6510AddressingModes.ACCUM, "bytes": 1, "cycles": 2}, /* ROR */
  {"opcode": 0x6B, "cmd": "ARR", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMMED },



  {"opcode": 0x6C, "cmd": "JMP", "example": "", "addressing": MOS6510AddressingModes.INDIA, "bytes": 3, "cycles": 5},
  {"opcode": 0x6D, "cmd": "ADC", "example": "ADC nnnn", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0x6E, "cmd": "ROR", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 6},
  {"opcode": 0x6F, "cmd": "RRA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSOL },

  {"opcode": 0x70, "cmd": "BVS", "example": "", "addressing": MOS6510AddressingModes.RELAT, "bytes": 2, "cycles": 2, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE | MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE}, /* BVS */
  {"opcode": 0x71, "cmd": "ADC", "example": "ADC (nn),Y", "addressing": MOS6510AddressingModes.ININD, "bytes": 2, "cycles": 5, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x72, "cmd": "???", "bytes": 1 },
  {"opcode": 0x73, "cmd": "RRA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ININD },
  {"opcode": 0x74, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX  },
  {"opcode": 0x75, "cmd": "ADC", "example": "ADC nn,X", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0x76, "cmd": "ROR", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 6},
  {"opcode": 0x77, "cmd": "RRA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX },
  {"opcode": 0x78, "cmd": "SEI", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* SEI */
  {"opcode": 0x79, "cmd": "ADC", "example": "", "addressing": MOS6510AddressingModes.ABSIY, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x7A, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMPLI },
  {"opcode": 0x7B, "cmd": "RRA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIY },
  {"opcode": 0x7C, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX },
  {"opcode": 0x7D, "cmd": "ADC", "example": "ADC nnnn,X", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0x7E, "cmd": "ROR", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 7},
  {"opcode": 0x7F, "cmd": "RRA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX },

  {"opcode": 0x80, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMPLI },
  {"opcode": 0x81, "cmd": "STA", "example": "", "addressing": MOS6510AddressingModes.INDIN, "bytes": 2, "cycles": 6},
  {"opcode": 0x82, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMMED },
  {"opcode": 0x83, "cmd": "SAX", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.INDIN },
  {"opcode": 0x84, "cmd": "STY", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3}, /* STY */
  {"opcode": 0x85, "cmd": "STA", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3}, /* STA */
  {"opcode": 0x86, "cmd": "STX", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3}, /* STX */
  {"opcode": 0x87, "cmd": "SAX", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP },
  {"opcode": 0x88, "cmd": "DEY", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* DEY */
  {"opcode": 0x89, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMMED },
  {"opcode": 0x8A, "cmd": "TXA", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* TXA */
  {"opcode": 0x8B, "cmd": "ANE", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMMED },
  {"opcode": 0x8C, "cmd": "STY", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0x8D, "cmd": "STA", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0x8E, "cmd": "STX", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0x8F, "cmd": "SAX", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSOL },


  {"opcode": 0x90, "cmd": "BCC", "example": "", "addressing": MOS6510AddressingModes.RELAT, "bytes": 2, "cycles": 2, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE | MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE}, /* BCC */
  {"opcode": 0x91, "cmd": "STA", "example": "", "addressing": MOS6510AddressingModes.ININD, "bytes": 2, "cycles": 6 },
  {"opcode": 0x92, "cmd": "???", "bytes": 1 },
  {"opcode": 0x93, "cmd": "SHA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ININD },
  {"opcode": 0x94, "cmd": "STY", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0x95, "cmd": "STA", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0x96, "cmd": "STX", "example": "", "addressing": MOS6510AddressingModes.ZEPIY, "bytes": 2, "cycles": 4},
  {"opcode": 0x97, "cmd": "SAX", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX  },
  {"opcode": 0x98, "cmd": "TYA", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* TYA */  
  {"opcode": 0x99, "cmd": "STA", "example": "", "addressing": MOS6510AddressingModes.ABSIY, "bytes": 3, "cycles": 5},
  {"opcode": 0x9A, "cmd": "TXS", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* TXS */
  {"opcode": 0x9B, "cmd": "SHS", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIY },
  {"opcode": 0x9C, "cmd": "SHY", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX },    
  {"opcode": 0x9D, "cmd": "STA", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 5},
  {"opcode": 0x9E, "cmd": "SHX", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX  },
  {"opcode": 0x9f, "cmd": "SHA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX },


  {"opcode": 0xA0, "cmd": "LDY", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* LDY */
  {"opcode": 0xA1, "cmd": "LDA", "example": "", "addressing": MOS6510AddressingModes.INDIN, "bytes": 2, "cycles": 6},
  {"opcode": 0xA2, "cmd": "LDX", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* LDX */
  {"opcode": 0xA3, "cmd": "LAX", "bytes": 2, "illegal": true, "addressing": MOS6510AddressingModes.INDIN  },
  {"opcode": 0xA4, "cmd": "LDY", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0xA5, "cmd": "LDA", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0xA6, "cmd": "LDX", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0xA7, "cmd": "LAX", "bytes": 2, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP },


  {"opcode": 0xA8, "cmd": "TAY", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* TAY */
  {"opcode": 0xA9, "cmd": "LDA", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* LDA */
  {"opcode": 0xAA, "cmd": "TAX", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* TAX */
  {"opcode": 0xAB, "cmd": "LXA", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMMED },
  {"opcode": 0xAC, "cmd": "LDY", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0xAD, "cmd": "LDA", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0xAE, "cmd": "LDX", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0xAF, "cmd": "LAX", "bytes": 3, "illegal": true, "addressing": MOS6510AddressingModes.ABSOL },


  {"opcode": 0xB0, "cmd": "BCS", "example": "", "addressing": MOS6510AddressingModes.RELAT, "bytes": 2, "cycles": 2, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE | MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE}, /* BCS */
  {"opcode": 0xB1, "cmd": "LDA", "example": "", "addressing": MOS6510AddressingModes.ININD, "bytes": 2, "cycles": 5, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xB2, "cmd": "???", "bytes": 1 },
  {"opcode": 0xB3, "cmd": "LAX", "bytes": 2, "illegal": true, "addressing": MOS6510AddressingModes.ININD },


  {"opcode": 0xB4, "cmd": "LDY", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0xB5, "cmd": "LDA", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0xB6, "cmd": "LDX", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0xB7, "cmd": "LAX", "bytes": 2, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX  },
  {"opcode": 0xB8, "cmd": "CLV", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* CLV */
  {"opcode": 0xB9, "cmd": "LDA", "example": "", "addressing": MOS6510AddressingModes.ABSIY, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xBA, "cmd": "TSX", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* TSX */
  {"opcode": 0xBB, "cmd": "LAS", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIY },
  {"opcode": 0xBC, "cmd": "LDY", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xBD, "cmd": "LDA", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles":  4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xBE, "cmd": "LDX", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 4, "cycleextra":  MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xBF, "cmd": "LAX", "bytes": 3, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX  },



  {"opcode": 0xC0, "cmd": "CPY", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* CPY */
  {"opcode": 0xC1, "cmd": "CMP", "example": "", "addressing": MOS6510AddressingModes.INDIN, "bytes": 2, "cycles": 6},
  {"opcode": 0xC2, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMMED },
  {"opcode": 0xC3, "cmd": "DCP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.INDIN },
  {"opcode": 0xC4, "cmd": "CPY", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0xC5, "cmd": "CMP", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0xC6, "cmd": "DEC", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 5}, /* DEC */
  {"opcode": 0xC7, "cmd": "DCP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP },
  {"opcode": 0xC8, "cmd": "INY", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* INY */
  {"opcode": 0xC9, "cmd": "CMP", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* CMP */
  {"opcode": 0xCA, "cmd": "DEX", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* DEX */
  {"opcode": 0xCB, "cmd": "SBX", "bytes": 2, "illegal": true, "addressing": MOS6510AddressingModes.IMMED },
  {"opcode": 0xCC, "cmd": "CPY", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0xCD, "cmd": "CMP", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0xCE, "cmd": "DEC", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 6},
  {"opcode": 0xCF, "cmd": "DCP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSOL },

  {"opcode": 0xD0, "cmd": "BNE", "example": "", "addressing": MOS6510AddressingModes.RELAT, "bytes": 2, "cycles": 2, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE | MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE}, /* BNE */
  {"opcode": 0xD1, "cmd": "CMP", "example": "", "addressing": MOS6510AddressingModes.ININD, "bytes": 2, "cycles": 5, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xD2, "cmd": "???", "bytes": 1 },
  {"opcode": 0xD3, "cmd": "DCP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ININD },
  {"opcode": 0xD4, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX  },
  {"opcode": 0xD5, "cmd": "CMP", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0xD6, "cmd": "DEC", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 6},
  {"opcode": 0xD7, "cmd": "DCP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX  },
  {"opcode": 0xD8, "cmd": "CLD", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* CLD */
  {"opcode": 0xD9, "cmd": "CMP", "example": "", "addressing": MOS6510AddressingModes.ABSIY, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xDA, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMPLI },
  {"opcode": 0xDB, "cmd": "DCP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIY },
  {"opcode": 0xDC, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX },
  {"opcode": 0xDD, "cmd": "CMP", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xDE, "cmd": "DEC", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 7},
  {"opcode": 0xDF, "cmd": "DCP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX },

  {"opcode": 0xE0, "cmd": "CPX", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* CPX */
  {"opcode": 0xE1, "cmd": "SBC", "example": "", "addressing": MOS6510AddressingModes.INDIN, "bytes": 2, "cycles": 6},
  {"opcode": 0xE2, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMMED },
  {"opcode": 0xE3, "cmd": "ISB", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.INDIN },
  {"opcode": 0xE4, "cmd": "CPX", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0xE5, "cmd": "SBC", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 3},
  {"opcode": 0xE6, "cmd": "INC", "example": "", "addressing": MOS6510AddressingModes.ZEROP, "bytes": 2, "cycles": 5}, /* INC */
  {"opcode": 0xe7, "cmd": "ISB", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSOL },
  {"opcode": 0xE8, "cmd": "INX", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* INX */
  {"opcode": 0xE9, "cmd": "SBC", "example": "", "addressing": MOS6510AddressingModes.IMMED, "bytes": 2, "cycles": 2}, /* SBC */
  {"opcode": 0xEA, "cmd": "NOP", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* NOP */
  {"opcode": 0xEB, "cmd": "SBC", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMMED },
  {"opcode": 0xEC, "cmd": "CPX", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0xED, "cmd": "SBC", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 4},
  {"opcode": 0xEE, "cmd": "INC", "example": "", "addressing": MOS6510AddressingModes.ABSOL, "bytes": 3, "cycles": 6},
  {"opcode": 0xEF, "cmd": "ISB", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSOL },

  {"opcode": 0xF0, "cmd": "BEQ", "example": "", "addressing": MOS6510AddressingModes.RELAT, "bytes": 2, "cycles": 2, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE | MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE}, /* BEQ */
  {"opcode": 0xF1, "cmd": "SBC", "example": "", "addressing": MOS6510AddressingModes.ININD, "bytes": 2, "cycles": 5, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xF2, "cmd": "???", "bytes": 1 },
  {"opcode": 0xF3, "cmd": "ISB", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ININD },
  {"opcode": 0xF4, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEROP },
  {"opcode": 0xF5, "cmd": "SBC", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 4},
  {"opcode": 0xF6, "cmd": "INC", "example": "", "addressing": MOS6510AddressingModes.ZEPIX, "bytes": 2, "cycles": 6},
  {"opcode": 0xF7, "cmd": "ISB", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ZEPIX  },
  {"opcode": 0xF8, "cmd": "SED", "example": "", "addressing": MOS6510AddressingModes.IMPLI, "bytes": 1, "cycles": 2}, /* SED */
  {"opcode": 0xF9, "cmd": "SBC", "example": "", "addressing": MOS6510AddressingModes.ABSIY, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xFA, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.IMPLI },
  {"opcode": 0xFB, "cmd": "ISB", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIY },
  {"opcode": 0xFC, "cmd": "NOP", "bytes": 1, "illegal": true, "addressing": MOS6510AddressingModes.ABSIX },
  {"opcode": 0xFD, "cmd": "SBC", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 4, "cycleextra": MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE},
  {"opcode": 0xFE, "cmd": "INC", "example": "", "addressing": MOS6510AddressingModes.ABSIX, "bytes": 3, "cycles": 7}

];


var mos6510examples = [{"opcode":"69","example":"ADC #nn","bytes":"2","cycles":"2"},{"opcode":"6D","example":"ADC nnnn","bytes":"3","cycles":"4"},{"opcode":"7D","example":"ADC nnnn,X","bytes":"3","cycles":"4*"},{"opcode":"79","example":"ADC nnnn,Y","bytes":"3","cycles":"4*"},{"opcode":"65","example":"ADC nn","bytes":"2","cycles":"3"},{"opcode":"75","example":"ADC nn,X","bytes":"2","cycles":"4*"},{"opcode":"61","example":"ADC (nn,X)","bytes":"2","cycles":"6"},{"opcode":"71","example":"ADC (nn),Y","bytes":"2","cycles":"5*"},{"opcode":"29","example":"AND #nn","bytes":"2","cycles":"2"},{"opcode":"2D","example":"AND nnnn","bytes":"3","cycles":"4"},{"opcode":"3D","example":"AND nnnn,X","bytes":"3","cycles":"4*"},{"opcode":"39","example":"AND nnnn,Y","bytes":"3","cycles":"4*"},{"opcode":"25","example":"AND nn","bytes":"2","cycles":"3"},{"opcode":"35","example":"AND nn,X","bytes":"2","cycles":"4"},{"opcode":"21","example":"AND (nn,X)","bytes":"2","cycles":"6"},{"opcode":"31","example":"AND (nn),Y","bytes":"2","cycles":"5"},{"opcode":"0A","example":"ASL A","bytes":"1","cycles":"2"},{"opcode":"0E","example":"ASL nnnn","bytes":"3","cycles":"6"},{"opcode":"1E","example":"ASL nnnn,X","bytes":"3","cycles":"7"},{"opcode":"06","example":"ASL nn","bytes":"2","cycles":"5"},{"opcode":"16","example":"ASL nn,X","bytes":"2","cycles":"6"},{"opcode":"90","example":"BCC nn","bytes":"2","cycles":"2*"},{"opcode":"B0","example":"BCS nnnn","bytes":"2","cycles":"2*"},{"opcode":"F0","example":"BEQ nnnn","bytes":"2","cycles":"2*"},{"opcode":"2C","example":"BIT nnnn","bytes":"3","cycles":"4"},{"opcode":"24","example":"BIT nn","bytes":"2","cycles":"3"},{"opcode":"30","example":"BMI nnnn","bytes":"2","cycles":"2*"},{"opcode":"D0","example":"BNE nnnn","bytes":"2","cycles":"2*"},{"opcode":"10","example":"BPL nnnn","bytes":"2","cycles":"2*"},{"opcode":"00","example":"BRK","bytes":"1","cycles":"7"},{"opcode":"50","example":"BVC nnnn","bytes":"2","cycles":"2*"},{"opcode":"70","example":"BVS nnnn","bytes":"2","cycles":"2*"},{"opcode":"18","example":"CLC","bytes":"1","cycles":"2"},{"opcode":"D8","example":"CLD","bytes":"1","cycles":"2"},{"opcode":"58","example":"CLI","bytes":"1","cycles":"2"},{"opcode":"B8","example":"CLV","bytes":"1","cycles":"2"},{"opcode":"C9","example":"CMP #nn","bytes":"2","cycles":"2"},{"opcode":"CD","example":"CMP nnnn","bytes":"3","cycles":"4"},{"opcode":"DD","example":"CMP nnnn,X","bytes":"3","cycles":"4*"},{"opcode":"D9","example":"CMP nnnn,Y","bytes":"3","cycles":"4*"},{"opcode":"C5","example":"CMP nn","bytes":"2","cycles":"3"},{"opcode":"D5","example":"CMP nn,X","bytes":"2","cycles":"4"},{"opcode":"C1","example":"CMP (nn,X)","bytes":"2","cycles":"6"},{"opcode":"D1","example":"CMP (nn),Y","bytes":"2","cycles":"5*"},{"opcode":"E0","example":"CPX #nn","bytes":"2","cycles":"2"},{"opcode":"EC","example":"CPX nnnn","bytes":"3","cycles":"4"},{"opcode":"E4","example":"CPX nn","bytes":"2","cycles":"3"},{"opcode":"C0","example":"CPY #nn","bytes":"2","cycles":"2"},{"opcode":"CC","example":"CPY nnnn","bytes":"3","cycles":"4"},{"opcode":"C4","example":"CPY nn","bytes":"2","cycles":"3"},{"opcode":"CE","example":"DEC nnnn","bytes":"3","cycles":"6"},{"opcode":"DE","example":"DEC nnnn,X","bytes":"3","cycles":"7"},{"opcode":"C6","example":"DEC nn","bytes":"2","cycles":"5"},{"opcode":"D6","example":"DEC nn,X","bytes":"2","cycles":"6"},{"opcode":"88","example":"DEY","bytes":"1","cycles":"2"},{"opcode":"49","example":"EOR #nn","bytes":"2","cycles":"2"},{"opcode":"4D","example":"EOR nnnn","bytes":"3","cycles":"4"},{"opcode":"5D","example":"EOR nnnn,X","bytes":"3","cycles":"4*"},{"opcode":"59","example":"EOR nnnn,Y","bytes":"3","cycles":"4*"},{"opcode":"45","example":"EOR nn","bytes":"2","cycles":"3"},{"opcode":"55","example":"EOR nn,X","bytes":"2","cycles":"4"},{"opcode":"41","example":"EOR (nn,X)","bytes":"2","cycles":"6"},{"opcode":"51","example":"EOR (nn),Y","bytes":"2","cycles":"5*"},{"opcode":"EE","example":"INC nnnn","bytes":"3","cycles":"6"},{"opcode":"FE","example":"INC nnnn,X","bytes":"3","cycles":"7"},{"opcode":"E6","example":"INC nn","bytes":"2","cycles":"5"},{"opcode":"F6","example":"INC nn,X","bytes":"2","cycles":"6"},{"opcode":"E8","example":"INX","bytes":"1","cycles":"2"},{"opcode":"C8","example":"INY","bytes":"1","cycles":"2"},{"opcode":"4C","example":"JMP nnnn","bytes":"3","cycles":"3"},{"opcode":"6C","example":"JMP (nnnn)","bytes":"3","cycles":"5"},{"opcode":"20","example":"JSR nnnn","bytes":"3","cycles":"6"},{"opcode":"A9","example":"LDA #nn","bytes":"2","cycles":"2"},{"opcode":"AD","example":"LDA nnnn","bytes":"3","cycles":"4"},{"opcode":"BD","example":"LDA nnnn,X","bytes":"3","cycles":"4*"},{"opcode":"B9","example":"LDA nnnn,Y","bytes":"3","cycles":"4*"},{"opcode":"A5","example":"LDA nn","bytes":"2","cycles":"3"},{"opcode":"B5","example":"LDA nn,X","bytes":"2","cycles":"4"},{"opcode":"A1","example":"LDA (nn,X)","bytes":"2","cycles":"6"},{"opcode":"B1","example":"LDA (nn),Y","bytes":"2","cycles":"5*"},{"opcode":"A2","example":"LDX #nn","bytes":"2","cycles":"2"},{"opcode":"AE","example":"LDX nnnn","bytes":"3","cycles":"4"},{"opcode":"BE","example":"LDX nnnn,Y","bytes":"3","cycles":"4*"},{"opcode":"A6","example":"LDX nn","bytes":"2","cycles":"3"},{"opcode":"B6","example":"LDX nn,Y","bytes":"2","cycles":"4"},{"opcode":"A0","example":"LDY #nn","bytes":"2","cycles":"2"},{"opcode":"AC","example":"LDY nnnn","bytes":"3","cycles":"4"},{"opcode":"BC","example":"LDY nnnn,X","bytes":"3","cycles":"4*"},{"opcode":"A4","example":"LDY nn","bytes":"2","cycles":"3"},{"opcode":"B4","example":"LDY nn,X","bytes":"2","cycles":"4"},{"opcode":"4A","example":"LSR A","bytes":"1","cycles":"2"},{"opcode":"4E","example":"LSR nnnn","bytes":"3","cycles":"6"},{"opcode":"5E","example":"LSR nnnn,X","bytes":"3","cycles":"7"},{"opcode":"46","example":"LSR nn","bytes":"2","cycles":"5"},{"opcode":"56","example":"LSR nn,X","bytes":"2","cycles":"6"},{"opcode":"EA","example":"NOP","bytes":"1","cycles":"2"},{"opcode":"09","example":"ORA #nn","bytes":"2","cycles":"2"},{"opcode":"0D","example":"ORA nnnn","bytes":"3","cycles":"4"},{"opcode":"1D","example":"ORA nnnn,X","bytes":"3","cycles":"4*"},{"opcode":"19","example":"ORA nnnn,Y","bytes":"3","cycles":"4*"},{"opcode":"05","example":"ORA nn","bytes":"2","cycles":"3"},{"opcode":"15","example":"ORA nn,X","bytes":"2","cycles":"4"},{"opcode":"01","example":"ORA (nn,X)","bytes":"2","cycles":"6"},{"opcode":"11","example":"ORA (nn),Y","bytes":"2","cycles":"5"},{"opcode":"48","example":"PHA","bytes":"1","cycles":"3"},{"opcode":"08","example":"PHP","bytes":"1","cycles":"3"},{"opcode":"68","example":"PLA","bytes":"1","cycles":"4"},{"opcode":"28","example":"PLP","bytes":"1","cycles":"4"},{"opcode":"2A","example":"ROL A","bytes":"1","cycles":"2"},{"opcode":"2E","example":"ROL nnnn","bytes":"3","cycles":"6"},{"opcode":"3E","example":"ROL nnnn,X","bytes":"3","cycles":"7"},{"opcode":"26","example":"ROL nn","bytes":"2","cycles":"5"},{"opcode":"36","example":"ROL nn,X","bytes":"2","cycles":"6"},{"opcode":"6A","example":"ROR","bytes":"1","cycles":"2"},{"opcode":"6E","example":"ROR nnnn","bytes":"3","cycles":"6"},{"opcode":"7E","example":"ROR nnnn,X","bytes":"3","cycles":"7"},{"opcode":"66","example":"ROR nn","bytes":"2","cycles":"5"},{"opcode":"76","example":"ROR nn,X","bytes":"2","cycles":"6"},{"opcode":"40","example":"RTI","bytes":"1","cycles":"6"},{"opcode":"60","example":"RTS","bytes":"1","cycles":"6"},{"opcode":"E9","example":"SBC #nn","bytes":"2","cycles":"2"},{"opcode":"ED","example":"SBC nnnn","bytes":"3","cycles":"4"},{"opcode":"FD","example":"SBC nnnn,X","bytes":"3","cycles":"4*"},{"opcode":"F9","example":"SBC nnnn,Y","bytes":"3","cycles":"4*"},{"opcode":"E5","example":"SBC nn","bytes":"2","cycles":"3"},{"opcode":"F5","example":"SBC nn,X","bytes":"2","cycles":"4"},{"opcode":"E1","example":"SBC (nn,X)","bytes":"2","cycles":"6"},{"opcode":"F1","example":"SBC (nn),Y","bytes":"2","cycles":"5*"},{"opcode":"38","example":"SEC","bytes":"1","cycles":"2"},{"opcode":"F8","example":"SED","bytes":"1","cycles":"2"},{"opcode":"78","example":"SEI","bytes":"1","cycles":"2"},{"opcode":"8D","example":"STA nnnn","bytes":"3","cycles":"4"},{"opcode":"9D","example":"STA nnnn,X","bytes":"3","cycles":"5"},{"opcode":"99","example":"STA nnnn,Y","bytes":"3","cycles":"5"},{"opcode":"85","example":"STA nn","bytes":"2","cycles":"3"},{"opcode":"95","example":"STA nn,X","bytes":"2","cycles":"4"},{"opcode":"81","example":"STA (nn,X)","bytes":"2","cycles":"6"},{"opcode":"91","example":"STA (nn),Y","bytes":"2","cycles":"6"},{"opcode":"8E","example":"STX nnnn","bytes":"3","cycles":"4"},{"opcode":"86","example":"STX nn","bytes":"2","cycles":"3"},{"opcode":"96","example":"STX nn,Y","bytes":"2","cycles":"4"},{"opcode":"8C","example":"STY nnnn","bytes":"3","cycles":"4"},{"opcode":"84","example":"STY nn","bytes":"2","cycles":"3"},{"opcode":"94","example":"STY nn,X","bytes":"2","cycles":"4"},{"opcode":"AA","example":"TAX","bytes":"1","cycles":"2"},{"opcode":"A8","example":"TAY","bytes":"1","cycles":"2"},{"opcode":"BA","example":"TSX","bytes":"1","cycles":"2"},{"opcode":"8A","example":"TXA","bytes":"1","cycles":"2"},{"opcode":"9A","example":"TXS","bytes":"1","cycles":"2"},{"opcode":"98","example":"TYA","bytes":"1","cycles":"2"}];


var MOS6510Bytes = [];
for(var i = 0; i < 0xffff; i++) {
  MOS6510Bytes[i] = 1;
}

for(var i = 0; i < mos6510examples.length; i++) {
  var opcode = parseInt(mos6510examples[i].opcode, 16);
  var example = mos6510examples[i].example;
  var bytes = mos6510examples[i].bytes;
  var cycles = mos6510examples[i].cycles;

  var found = false;
  for(var j = 0; j < MOS6510Opcodes.length; j++) {
    if(MOS6510Opcodes[j].opcode == opcode) {
      MOS6510Opcodes[j].example = example;
      MOS6510Bytes[opcode] = MOS6510Opcodes[j].bytes;
      
      if(bytes != MOS6510Opcodes[j].bytes) {
      }
      found = true;
      break;
    }
  }

  if(!found) {
    console.log("NOT FOUND!!!!! " + mos6510examples[i].opcode);
  }
}


/*
105 69  Immediate ADC #nn 2 2
109 6D  Absolute  ADC nnnn  3 4
125 7D  Absolute,X  ADC nnnn,X  3 4*
121 79  Absolute,Y  ADC nnnn,Y  3 4*
101 65  Zeropage  ADC nn  2 3
117 75  Zeropage,X  ADC nn,X  2 4*
97  61  Indexed-indirect  ADC (nn,X)  2 6
113 71  Indirect-indexed  ADC (nn),Y  2 5*
41  29  Immediate AND #nn 2 2
45  2D  Absolute  AND nnnn  3 4
61  3D  Absolute,X  AND nnnn,X  3 4*
57  39  Absolute,Y  AND nnnn,Y  3 4*
37  25  Zeropage  AND nn  2 3
53  35  Zeropage,X  AND nn,X  2 4
33  21  Indexed-indirect  AND (nn,X)  2 6
49  31  Indirect-indexed  AND (nn),Y  2 5
10  0A  Accumulator ASL A 1 2
14  0E  Absolute  ASL nnnn  3 6
30  1E  Absolute,X  ASL nnnn,X  3 7
6 06  Zeropage  ASL nn  2 5
22  16  Zeropage,X  ASL nn,X  2 6
144 90  Relative  BCC nn  2 2*
176 B0  Relative  BCS nnnn  2 2*
240 F0  Relative  BEQ nnnn  2 2*
44  2C  Absolute  BIT nnnn  3 4
36  24  Zeropage  BIT nn  2 3
48  30  Relative  BMI nnnn  2 2*
208 D0  Relative  BNE nnnn  2 2*
16  10  Relative  BPL nnnn  2 2*
0 00  Implied BRK 1 7
80  50  Relative  BVC nnnn  2 2*
112 70  Relative  BVS nnnn  2 2*
24  18  Implied CLC 1 2
216 D8  Implied CLD 1 2
88  58  Implied CLI 1 2
184 B8  Implied CLV 1 2
201 C9  Immediate CMP #nn 2 2
205 CD  Absolute  CMP nnnn  3 4
221 DD  Absolute,X  CMP nnnn,X  3 4*
217 D9  Absolute,Y  CMP nnnn,Y  3 4*
197 C5  Zeropage  CMP nn  2 3
213 D5  Zeropage,X  CMP nn,X  2 4
193 C1  Indexed-indirect  CMP (nn,X)  2 6
209 D1  Indirect-indexed  CMP (nn),Y  2 5*
224 E0  Immediate CPX #nn 2 2
236 EC  Absolute  CPX nnnn  3 4
228 E4  Zeropage  CPX nn  2 3
192 C0  Immediate CPY #nn 2 2
204 CC  Absolute  CPY nnnn  3 4
196 C4  Zeropage  CPY nn  2 3
206 CE  Absolute  DEC nnnn  3 6
222 DE  Absolute,X  DEC nnnn,X  3 7
198 C6  Zeropage  DEC nn  2 5
214 D6  Zeropage,X  DEC nn,X  2 6
136 88  Implied DEY 1 2
73  49  Immediate EOR #nn 2 2
77  4D  Absolute  EOR nnnn  3 4
93  5D  Absolute,X  EOR nnnn,X  3 4*
89  59  Absolute,Y  EOR nnnn,Y  3 4*
69  45  Zeropage  EOR nn  2 3
85  55  Zeropage,X  EOR nn,X  2 4
65  41  Indexed-indirect  EOR (nn,X)  2 6
81  51  Indirect-indexed  EOR (nn),Y  2 5*
238 EE  Absolute  INC nnnn  3 6
254 FE  Absolute,X  INC nnnn,X  3 7
230 E6  Zeropage  INC nn  2 5
246 F6  Zeropage,X  INC nn,X  2 6
232 E8  Implied INX 1 2
200 C8  Implied INY 1 2
76  4C  Absolute  JMP nnnn  3 3
108 6C  Indirect  JMP (nnnn)  3 5
32  20  Absolute  JSR nnnn  3 6
169 A9  Immediate LDA #nn 2 2
173 AD  Absolute  LDA nnnn  3 4
189 BD  Absolute,X  LDA nnnn,X  3 4*
185 B9  Absolute,Y  LDA nnnn,Y  3 4*
165 A5  Zeropage  LDA nn  2 3
181 B5  Zeropage,X  LDA nn,X  2 4
161 A1  Indexed-indirect  LDA (nn,X)  2 6
177 B1  Indirect-indexed  LDA (nn),Y  2 5*
162 A2  Immediate LDX #nn 2 2
174 AE  Absolute  LDX nnnn  3 4
190 BE  Absolute,Y  LDX nnnn,Y  3 4*
166 A6  Zeropage  LDX nn  2 3
182 B6  Zeropage,Y  LDX nn,Y  2 4
160 A0  Immediate LDY #nn 2 2
172 AC  Absolute  LDY nnnn  3 4
188 BC  Absolute,X  LDY nnnn,X  3 4*
164 A4  Zeropage  LDY nn  2 3
180 B4  Zeropage,X  LDY nn,X  2 4
74  4A  Accumulator LSR A 1 2
78  4E  Absolute  LSR nnnn  3 6
94  5E  Absolute,X  LSR nnnn,X  3 7
70  46  Zeropage  LSR nn  2 5
86  56  Zeropage,X  LSR nn,X  2 6
234 EA  Implied NOP 1 2
9 09  Immediate ORA #nn 2 2
13  0D  Absolute  ORA nnnn  3 4
29  1D  Absolute,X  ORA nnnn,X  3 4*
25  19  Absolute,Y  ORA nnnn,Y  3 4*
5 05  Zeropage  ORA nn  2 3
21  15  Zeropage,X  ORA nn,X  2 4
1 01  Indexed-indirect  ORA (nn,X)  2 6
17  11  Indirect-indexed  ORA (nn),Y  2 5
72  48  Implied PHA 1 3
8 08  Implied PHP 1 3
104 68  Implied PLA 1 4
40  28  Implied PLP 1 4
42  2A  Accumulator ROL A 1 2
46  2E  Absolute  ROL nnnn  3 6
62  3E  Absolute,X  ROL nnnn,X  3 7
38  26  Zeropage  ROL nn  2 5
54  36  Zeropage,X  ROL nn,X  2 6
106 6A  Accumulator ROR 1 2
110 6E  Absolute  ROR nnnn  3 6
126 7E  Absolute,X  ROR nnnn,X  3 7
102 66  Zeropage  ROR nn  2 5
118 76  Zeropage,X  ROR nn,X  2 6
64  40  Implied RTI 1 6
96  60  Implied RTS 1 6
233 E9  Immediate SBC #nn 2 2
237 ED  Absolute  SBC nnnn  3 4
253 FD  Absolute,X  SBC nnnn,X  3 4*
249 F9  Absolute,Y  SBC nnnn,Y  3 4*
229 E5  Zeropage  SBC nn  2 3
245 F5  Zeropage,X  SBC nn,X  2 4
225 E1  Indexed-indirect  SBC (nn,X)  2 6
241 F1  Indirect-indexed  SBC (nn),Y  2 5*
56  38  Implied SEC 1 2
248 F8  Implied SED 1 2
120 78  Implied SEI 1 2
141 8D  Absolute  STA nnnn  3 4
157 9D  Absolute,X  STA nnnn,X  3 5
153 99  Absolute,Y  STA nnnn,Y  3 5
133 85  Zeropage  STA nn  2 3
149 95  Zeropage,X  STA nn,X  2 4
129 81  Indexed-indirect  STA (nn,X)  2 6
145 91  Indirect-indexed  STA (nn),Y  2 6
142 8E  Absolute  STX nnnn  3 4
134 86  Zeropage  STX nn  2 3
150 96  Zeropage,Y  STX nn,Y  2 4
140 8C  Absolute  STY nnnn  3 4
132 84  Zeropage  STY nn  2 3
148 94  Zeropage,X  STY nn,X  2 4
170 AA  Implied TAX 1 2
168 A8  Implied TAY 1 2
186 BA  Implied TSX 1 2
138 8A  Implied TXA 1 2
154 9A  Implied TXS 1 2
152 98  Implied TYA 1 2
*/