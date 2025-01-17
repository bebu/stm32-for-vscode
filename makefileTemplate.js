/* eslint-disable sort-vars */
/* eslint-disable max-lines-per-function */
// @ts-nocheck
const _ = require('lodash');

function createStringList(arr) {
  let output = '';
  _.map(arr, (entry, ind) => {
    output += `${entry}`;
    if (ind < arr.length - 1) {
      output += ' \\';
    }
    output += '\r\n';
  });

  return output;
}


function convertTemplate(info) {
  // NOTE: check for the correct info needs to be given beforehand
  const makeInfo = {
    cSources: _.get(info, 'cSources', []),
    cppSources: _.get(info, 'cppSources', []),
    asmSources: _.get(info, 'asmSources', []),
    cpu: _.get(info, 'cpu', ''),
    fpu: _.get(info, 'fpu', ''),
    floatAbi: _.get(info, 'floatAbi', ''),
    mcu: _.get(info, 'mcu', ''),
    cDefinitions: _.get(info, 'cDefinitions', []),
    cIncludes: _.get(info, 'cIncludes', []),
    cppIncludes: _.get(info, 'cppIncludes', []),
    linkerScript: _.get(info, 'linkerScript', ''),
    target: _.get(info, 'target', 'firmware'),
  };
  makeInfo.cIncludes.concat(makeInfo.cppIncludes);
  makeInfo.cIncludes = _.uniq(makeInfo.cIncludes);

  const makeFile = `##########################################################################################################################
# File automatically-generated by STM32forVSCode: [projectgenerator] version: [3.0.0] date: [Fri Jan 25 18:00:27 CET 2019]
##########################################################################################################################

# ------------------------------------------------
# Generic Makefile (based on gcc)
#
# ChangeLog :
#	2017-02-10 - Several enhancements + project update mode
#   2015-07-22 - first version
# ------------------------------------------------

######################################
# target
######################################
TARGET = ${makeInfo.target}


######################################
# building variables
######################################
# debug build?
DEBUG = 1
# optimization
OPT = -Og


#######################################
# paths
#######################################
# Build path
BUILD_DIR = build

######################################
# source
######################################
# C sources
C_SOURCES =  ${'\\'}
${createStringList(makeInfo.cSources)}

CPP_SOURCES = ${'\\'}
${createStringList(makeInfo.cppSources)}

# ASM sources
ASM_SOURCES =  ${'\\'}
${createStringList(makeInfo.asmSources)}


#######################################
# binaries
#######################################
PREFIX = arm-none-eabi-
# The gcc compiler bin path can be either defined in make command via GCC_PATH variable (> make GCC_PATH=xxx)
# either it can be added to the PATH environment variable.
ifdef GCC_PATH
CXX = $(GCC_PATH)/$(PREFIX)g++
CC = $(GCC_PATH)/$(PREFIX)gcc
AS = $(GCC_PATH)/$(PREFIX)gcc -x assembler-with-cpp
CP = $(GCC_PATH)/$(PREFIX)objcopy
SZ = $(GCC_PATH)/$(PREFIX)size
else
CXX = $(PREFIX)g++
CC = $(PREFIX)gcc
AS = $(PREFIX)gcc -x assembler-with-cpp
CP = $(PREFIX)objcopy
SZ = $(PREFIX)size
endif
HEX = $(CP) -O ihex
BIN = $(CP) -O binary -S
	
#######################################
# CFLAGS
#######################################
# cpu
CPU = ${makeInfo.cpu}

# fpu
FPU = ${makeInfo.fpu}

# float-abi
FLOAT-ABI = ${makeInfo.floatAbi}

# mcu
MCU = ${makeInfo.mcu}

# macros for gcc
# AS defines
AS_DEFS = 

# C defines
C_DEFS =  ${'\\'}
${createStringList(makeInfo.cDefinitions)}


# AS includes
AS_INCLUDES = ${'\\'}
${createStringList(makeInfo.asmIncludes)}

# C includes
C_INCLUDES =  ${'\\'}
${createStringList(makeInfo.cIncludes)}


# compile gcc flags
ASFLAGS = $(MCU) $(AS_DEFS) $(AS_INCLUDES) $(OPT) -Wall -fdata-sections -ffunction-sections

CFLAGS = $(MCU) $(C_DEFS) $(C_INCLUDES) $(OPT) -Wall -fdata-sections -ffunction-sections

ifeq ($(DEBUG), 1)
CFLAGS += -g -gdwarf-2
endif


# Generate dependency information
CFLAGS += -MMD -MP -MF"$(@:%.o=%.d)"

CXXFLAGS?=
CXXFLAGS += -feliminate-unused-debug-types

#######################################
# LDFLAGS
#######################################
# link script
LDSCRIPT = ${makeInfo.linkerScript}

# libraries
LIBS = -lc -lm -lnosys 
LIBDIR = 
LDFLAGS = $(MCU) -specs=nosys.specs -T$(LDSCRIPT) $(LIBDIR) $(LIBS) -Wl,-Map=$(BUILD_DIR)/$(TARGET).map,--cref -Wl,--gc-sections

# default action: build all
all: $(BUILD_DIR)/$(TARGET).elf $(BUILD_DIR)/$(TARGET).hex $(BUILD_DIR)/$(TARGET).bin


#######################################
# build the application
#######################################
# list of cpp program objects
OBJECTS = $(addprefix $(BUILD_DIR)/,$(notdir $(CPP_SOURCES:.cpp=.o)))
vpath %.cpp $(sort $(dir $(CPP_SOURCES)))
# list of C objects
OBJECTS += $(addprefix $(BUILD_DIR)/,$(notdir $(C_SOURCES:.c=.o)))
vpath %.c $(sort $(dir $(C_SOURCES)))
# list of ASM program objects
OBJECTS += $(addprefix $(BUILD_DIR)/,$(notdir $(ASM_SOURCES:.s=.o)))
vpath %.s $(sort $(dir $(ASM_SOURCES)))

$(BUILD_DIR)/%.o: %.cpp Makefile | $(BUILD_DIR) 
	$(CXX) -c $(CXXFLAGS) $(CFLAGS) -Wa,-a,-ad,-alms=$(BUILD_DIR)/$(notdir $(<:.cpp=.lst)) $< -o $@

$(BUILD_DIR)/%.o: %.c Makefile | $(BUILD_DIR) 
	$(CC) -c $(CFLAGS) -Wa,-a,-ad,-alms=$(BUILD_DIR)/$(notdir $(<:.c=.lst)) $< -o $@

$(BUILD_DIR)/%.o: %.s Makefile | $(BUILD_DIR)
	$(AS) -c $(CFLAGS) $< -o $@

$(BUILD_DIR)/$(TARGET).elf: $(OBJECTS) Makefile
	$(CC) $(OBJECTS) $(LDFLAGS) -o $@
	$(SZ) $@

$(BUILD_DIR)/%.hex: $(BUILD_DIR)/%.elf | $(BUILD_DIR)
	$(HEX) $< $@
	
$(BUILD_DIR)/%.bin: $(BUILD_DIR)/%.elf | $(BUILD_DIR)
	$(BIN) $< $@	
	
$(BUILD_DIR):
	mkdir $@		

#######################################
# clean up
#######################################
clean:
	-rm -fR $(BUILD_DIR)
	
#######################################
# dependencies
#######################################
-include $(wildcard $(BUILD_DIR)/*.d)

# *** EOF ***`;

  return makeFile;
}

module.exports = convertTemplate;
