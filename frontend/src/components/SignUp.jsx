import { Flex, Box, FormControl, FormLabel, Input, InputGroup, HStack, InputRightElement, Stack, Button, Heading, Text, useColorModeValue, Link } from '@chakra-ui/react'
import { useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useSetRecoilState } from 'recoil';
import authScreenAtom from '../atoms/authAtom'
import useShowToast from '../hooks/useShowToast'
import userAtom from '../atoms/userAtom'
import axiosInstance from '../lib/axios'; // your axios instance

export default function SignUp() {
    const setAuthScreen = useSetRecoilState(authScreenAtom);
    const setUser = useSetRecoilState(userAtom);
    const [showPassword, setShowPassword] = useState(false);
    const showToast = useShowToast();
    const [loading, setLoading] = useState(false);
    const [inputs, setInputs] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });

    const handleSignup = async () => {
        setLoading(true);

        try {
            const res = await axiosInstance.post("/users/signup", inputs);
            const data = res.data;

            if (data.error) {
                showToast("Error", data.error.message, "error");
                return;
            }

            localStorage.setItem("user", JSON.stringify(data));
            setUser(data);
        } catch(error) {
            showToast(
              "Error", 
              error.response?.data?.error || error.message || "Signup failed", 
              "error"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Flex
            align={'center'}
            justify={'center'}>
            <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'4xl'} textAlign={'center'}>
                        Sign up
                    </Heading>
                </Stack>
                <Box
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.dark')}
                    boxShadow={'lg'}
                    p={8}>
                    <Stack spacing={4}>
                        <HStack>
                            <Box>
                                <FormControl isRequired>
                                    <FormLabel>Full Name</FormLabel>
                                    <Input 
                                        type="text" 
                                        onChange={(e) => setInputs({...inputs, name: e.target.value})}
                                        value={inputs.name}    
                                    />
                                </FormControl>
                            </Box>
                            <Box>
                                <FormControl isRequired>
                                    <FormLabel>Username</FormLabel>
                                    <Input 
                                        type="text" 
                                        onChange={(e) => setInputs({...inputs, username: e.target.value})}
                                        value={inputs.username} 
                                    />
                                </FormControl>
                            </Box>
                        </HStack>
                        <FormControl isRequired>
                            <FormLabel>Email address</FormLabel>
                            <Input 
                                type="email" 
                                onChange={(e) => setInputs({...inputs, email: e.target.value})}
                                value={inputs.email} 
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <Input 
                                    type={showPassword ? 'text' : 'password'} 
                                    onChange={(e) => setInputs({...inputs, password: e.target.value})}
                                    value={inputs.password} 
                                />
                                <InputRightElement h={'full'}>
                                    <Button
                                    variant={'ghost'}
                                    onClick={() => setShowPassword((showPassword) => !showPassword)}>
                                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText="Signing up"
                                size="lg"
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={'white'}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                                onClick={handleSignup}
                                isLoading={loading}>
                                Sign up
                            </Button>
                        </Stack>
                        <Stack pt={6}>
                            <Text align={'center'}>
                                Already have an account? <Link color={'blue.400'} onClick={() => setAuthScreen("login")}>Login</Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    )
}
