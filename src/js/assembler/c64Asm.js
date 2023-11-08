var c64Asm_macro = "";
c64Asm_macro += ";; Start of BASIC program\n";
c64Asm_macro += "basic = $0801\n";
c64Asm_macro += "!macro start_at .address {\n";
c64Asm_macro += "  * = basic\n";
c64Asm_macro += "  !byte $0c,$08,$00,$00,$9e\n";
c64Asm_macro += "  !if .address >= 10000 { !byte 48 + ((.address / 10000) % 10) }\n";
c64Asm_macro += "  !if .address >=  1000 { !byte 48 + ((.address /  1000) % 10) }\n";
c64Asm_macro += "  !if .address >=   100 { !byte 48 + ((.address /   100) % 10) }\n";
c64Asm_macro += "  !if .address >=    10 { !byte 48 + ((.address /    10) % 10) }\n";
c64Asm_macro += "  !byte $30 + (.address % 10), $00, $00, $00\n";
c64Asm_macro += "  * = .address\n";
c64Asm_macro += "}\n";


var c64Asm_example = "";
c64Asm_example += "!source \"inc/macros.asm\"\n\n";
c64Asm_example += '; macro to create the basic program to start code\n';
c64Asm_example += "+start_at $0900\n\n";
c64Asm_example += "  lda #00   \n";
c64Asm_example += "  sta $d020  ; border colour\n";
c64Asm_example += "  sta $d021  ; background colour\n";
c64Asm_example += "loop\n";
c64Asm_example += "  inc $d021    ; increase background colour\n";
c64Asm_example += "  jmp loop     ; loop forever\n";

/*

<%
  for(let i = 0; i < 10; i++) {
%>
  lda #<%= i %>
  sta $d020
<%
  }
%>
*/
//c64Asm_example += "!binary <%= createBin({ source: \"/tile sets/Tile Set\" }) %>";
