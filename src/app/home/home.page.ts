import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  nombreUsuario: string = '';
  viajes: any[] = [];
  mostrarFormularioProgramarViaje: boolean = false;
  mostrarListaViajes: boolean = false;

  // Definición de nuevoViaje con valores por defecto
  nuevoViaje: any = {
    destino: '',
    costo: '',
    asientos_disponibles: '',
    hora_salida: '',
    fecha: ''
  };
  

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.nombreUsuario = currentUser.username;
    this.obtenerViajes();
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  mostrarProgramarViaje() {
    this.mostrarFormularioProgramarViaje = true;
    this.mostrarListaViajes = false;
  }

  mostrarBuscarViaje() {
    this.mostrarListaViajes = true;
    this.mostrarFormularioProgramarViaje = false;
    this.obtenerViajes();
  }

  obtenerViajes() {
    this.usuarioService.getViajes().subscribe(
      (data) => {
        this.viajes = data;
      },
      (error) => {
        console.error('Error al obtener viajes', error);
      }
    );
  }

  programarViaje() {
    const currentUser = this.authService.getCurrentUser();
    
    // Verificar que el usuario actual esté definido y tenga el conductorId
    if (!currentUser || !currentUser.conductorId) {
      alert('No se ha encontrado el conductor. Asegúrate de estar registrado.');
      return;
    }
  
    // Validar que todos los campos necesarios estén presentes
    if (!this.nuevoViaje.destino || 
        this.nuevoViaje.costo <= 0 || 
        this.nuevoViaje.asientos_disponibles <= 0 || 
        !this.nuevoViaje.hora_salida || 
        !this.nuevoViaje.fecha) {
      alert('Por favor, completa todos los campos requeridos y asegúrate de que sean válidos.');
      return;
    }
  
    // Agregar el ID del conductor al objeto nuevoViaje
    const viajeData = {
      conductor_id: currentUser.conductorId,
      destino: this.nuevoViaje.destino,
      costo: this.nuevoViaje.costo,
      asientos_disponibles: this.nuevoViaje.asientos_disponibles,
      hora_salida: this.nuevoViaje.hora_salida,
      fecha: this.nuevoViaje.fecha
    };
  
    console.log('Nuevo viaje a crear:', viajeData); // Para depuración
  
    // Llamar al método crearViaje en el servicio
    this.usuarioService.crearViaje(viajeData, currentUser.conductorId).subscribe(
      (response) => {
        console.log('Viaje creado', response);
        
        // Almacenar el ID del viaje si es necesario
        if (response && response.id) {
          localStorage.setItem('viajeId', response.id);
        }
        
        // Reinicia el formulario
        this.nuevoViaje = {
          destino: '',
          costo: 0,
          asientos_disponibles: 0,
          hora_salida: '',
          fecha: ''
        }; 
        this.mostrarFormularioProgramarViaje = false; // Oculta el formulario
        this.obtenerViajes(); // Actualiza la lista de viajes
      },
      (error) => {
        console.error('Error al crear viaje', error);
        alert('Error al crear el viaje. Por favor, inténtalo de nuevo.');
      }
    );
  }
  
  
  reservarViaje(viajeId: number) {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    console.log('Datos de reserva:', { viaje_id: viajeId, pasajero_id: currentUser.id });
  
    this.usuarioService.reservarViaje(viajeId, currentUser.id).subscribe(
      (response) => {
        console.log('Viaje reservado', response);
        this.obtenerViajes();
      },
      (error) => {
        console.error('Error al reservar viaje', error);
        alert('Error al reservar el viaje: ' + (error.error?.message || 'Por favor, inténtalo de nuevo.'));
      }
    );
  }
  
  
}