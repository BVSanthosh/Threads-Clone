import { Button, Flex, FormControl, FormLabel, Heading, Input, Stack, useColorModeValue, Avatar, AvatarBadge, IconButton, Center, useSafeLayoutEffect } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import userAtom from '../atoms/userAtom';
import { useRecoilState } from 'recoil';
import usePreviewImage from '../hooks/usePreviewImage';
import useShowToast from '../hooks/useShowToast';

export default function UpdateProfilePage() {
  const [user, setUser] = useRecoilState(userAtom); 
  const [inputs, setInptus] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    password: "",
  });
  const fileRef = useRef();
  const { handleImageChange, imageUrl } = usePreviewImage();
  const showToast = useShowToast();
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (updating) return;

    setUpdating(true);

    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...inputs, profilePic: imageUrl})
      })

      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error.message, "error");
        return;
      }

      showToast("Success", "Profile updated successfully", "success");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex
        align={'center'}
        justify={'center'}>
        <Stack
          spacing={4}
          w={'full'}
          maxW={'md'}
          bg={useColorModeValue('white', 'gray.dark')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}>
          <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
            User Profile Edit
          </Heading>
          <FormControl id="userName">
            <Stack direction={['column', 'row']} spacing={6}>
              <Center>
                <Avatar boxShadow={"md"} size="xl" src={imageUrl || user.profilePic } />
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => fileRef.current.click()}>Change Avatar</Button>
                <Input type="file" ref={fileRef} onChange={handleImageChange} hidden/>
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Full Name</FormLabel>
            <Input
              placeholder="full name"
              value={inputs.name}
              onChange={(e) => setInptus({...inputs, name: e.target.value})}
              _placeholder={{ color: 'gray.500' }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              placeholder="username"
              value={inputs.username}
              onChange={(e) => setInptus({...inputs, username: e.target.value})}
              _placeholder={{ color: 'gray.500' }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="email"
              value={inputs.email}
              onChange={(e) => setInptus({...inputs, email: e.target.value})}
              _placeholder={{ color: 'gray.500' }}
              type="email"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input
              placeholder="bio"
              value={inputs.bio}
              onChange={(e) => setInptus({...inputs, bio: e.target.value})}
              _placeholder={{ color: 'gray.500' }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="password"
              value={inputs.password}
              onChange={(e) => setInptus({...inputs, password: e.target.value})}
              _placeholder={{ color: 'gray.500' }}
              type="password"
            />
          </FormControl>
          <Stack spacing={6} direction={['column', 'row']}>
            <Button
              bg={'red.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'red.500',
              }}>
              Cancel
            </Button>
            <Button
              bg={'green.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'green.500',
              }}
              type="submit"
              isLoading={updating}>
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  )
}